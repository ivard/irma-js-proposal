const network = require('./network');

const SessionStatus = {
  Initialized: 'INITIALIZED', // The session has been started and is waiting for the client to connect (scan the QR)
  Connected  : 'CONNECTED',   // The client has retrieved the session request, we wait for its response
  Cancelled  : 'CANCELLED',   // The session is cancelled, possibly due to an error
  Done       : 'DONE',        // The session has completed successfully
  Timeout    : 'TIMEOUT',     // Session timed out
};


module.exports = class IrmaServer {

  constructor(server, debugging) {
    this._server    = server;
    this._debugging = debugging;
    this._session   = {};
  }

  startSession(request) {
    return this._startSession(this._server, request);
  }


  /**
   * Start an IRMA session at an irmaserver.
   * @param {string} server URL to irmaserver at which to start the session
   * @param {Object} request Session request
   * @param {string} method authentication method (supported: undefined, none, token, hmac, publickey)
   * @param {*} key API token or JWT key
   * @param {string} name name of the requestor, only for hmac and publickey mode
   */
  _startSession(server, request, method, key, name) {
    return Promise.resolve()
      .then(() => {
        if (typeof(request) === 'object')
          return method == 'publickey' || method == 'hmac' ? this._signSessionRequest(request, method, key, name) : JSON.stringify(request);
        else
          return request;
      })
      .then((body) => {
        let headers = {};
        switch (method) {
          case undefined: case 'none':
            headers['Content-Type'] = 'application/json';
            break;
          case 'token':
            headers['Authorization'] = key;
            headers['Content-Type'] = 'application/json';
            break;
          case 'publickey': case 'hmac':
            headers['Content-Type'] = 'text/plain';
            break;
          default:
            throw new Error('Unsupported authentication method');
        }
        return network.fetchCheck(`${server}/session`, {method: 'POST', headers, body});
      })
      .then((res) => res.json());
  }

  /**
   * Sign a session request into a JWT, using the HMAC (HS256) or RSA (RS256) signing algorithm.
   * @param {Object} request Session request
   * @param {string} method authentication method (supported: undefined, none, token, hmac, publickey)
   * @param {*} key API token or JWT key
   * @param {string} name name of the requestor, only for hmac and publickey mode
   */
  _signSessionRequest(request, method, key, name) {
    return import(/* webpackChunkName: "jwt" */ 'jsonwebtoken').then(jwt => {
      let type;
      let rrequest;
      if (request.type) {
        type = request.type;
        rrequest = { request };
      } else if (request.request) {
        type = request.request.type;
        rrequest = request;
      }

      if (type !== 'disclosing' && type !== 'issuing' && type !== 'signing')
        throw new Error('Not an IRMA session request');
      if (method !== 'publickey' && method !== 'hmac')
        throw new Error('Unsupported signing method');

      const subjects = { disclosing: 'verification_request', issuing: 'issue_request', signing: 'signature_request' };
      const fields = { disclosing: 'sprequest', issuing: 'iprequest', signing: 'absrequest' };
      const algorithm = method === 'publickey' ? 'RS256' : 'HS256';
      const jwtOptions = { algorithm, issuer: name, subject: subjects[type] };

      return jwt.sign({[ fields[type] ] : rrequest}, key, jwtOptions);
    });
  }

  _setupSession(qr, state, options) {
    state.qr = qr;
    state.done = false;

    // When we start the session is always in the Initialized state, but the state at which
    // we return control to the caller depends on the options. See the function comment.
    // We implement this by 4 chained promises, each of which can "break out of the chain" by
    // setting state.done to true, after which all remaining then's return immediately.

    return Promise.resolve()
      // 1st phase: session started, phone not yet connected
      .then(() => {
        if ( this._debugging )
          console.log('Session started', state.qr);
        // state.options = processOptions(options);
        // TODO: this was a quick-fix
        state.options = options;
        state.method = state.options.method;

        if (state.options.returnStatus === SessionStatus.Initialized) {
          state.done = true;
          return SessionStatus.Initialized;
        }

        return this._waitConnected(state.qr.u);
      })

      .catch((err) => {
        console.error('Error or unexpected status', err);
        // if (state.method === 'popup') closePopup();
        throw err;
      });
  }

  _finishSession(status, state) {
    return Promise.resolve()
      // 2nd phase: phone connected
      .then(() => {
        if (state.done) return status;

        if ( this._debugging )
          console.log('Session state changed', status, state.qr.u);
        // switch (state.method) {
        //   case 'popup':
        //     translatePopupElement('irma-text', 'Messages.FollowInstructions', state.options.language);
        //     // fallthrough
        //   case 'canvas':
        //     clearQr(state.canvas, state.options.showConnectedIcon);
        //     break;
        // }

        if (state.options.returnStatus === SessionStatus.Connected) {
          state.done = true;
          return status;
        }
        return this._waitDone(state.qr.u);
      })

      // 3rd phase: session done
      .then((status) => {
        if (state.done) return status;

        // if (state.method === 'popup')
        //   closePopup();
        if (state.options.server.length === 0) {
          state.done = true;
          return status;
        }

        const jwtType = state.options.legacyResultJwt ? 'getproof' : 'result-jwt';
        const endpoint = state.options.resultJwt || state.options.legacyResultJwt ? jwtType : 'result';
        if ( this._debugging )
          console.log("Requesting: ", `${state.options.server}/session/${state.options.token}/${ endpoint }`);
        return network.fetchCheck(`${state.options.server}/session/${state.options.token}/${ endpoint }`);
      })

      // 4th phase: handle session result received from irmaserver
      .then((response) => {
        if (state.done) return response;
        return state.options.resultJwt || state.options.legacyResultJwt ? response.text() : response.json();
      })

      .catch((err) => {
        console.error('Error or unexpected status', err);
        // if (state.method === 'popup') closePopup();
        throw err;
      });
  }

  /**
   * Poll the status URL of an IRMA server until it indicates that
   * the status is no longer Initialized, i.e. Connected or Done. Rejects
   * on other states (Cancelled, Timeout).
   * @param {string} url
   */
  _waitConnected(url) {
    return network.waitStatus(url, SessionStatus.Initialized, this._debugging)
      .then((status) => {
        if (status !== SessionStatus.Connected && status !== SessionStatus.Done)
          return Promise.reject(status);
        return status;
      });
  }

  /**
   * Poll the status URL of an IRMA server until it indicates that the status
   * has changed from Connected to Done. Rejects on any other state.
   * @param {string} url
   */
  _waitDone(url) {
    return network.waitStatus(url, SessionStatus.Connected, this._debugging)
      .then((status) => {
        if (status !== SessionStatus.Done)
          return Promise.reject(status);
        return status;
      });
  }

}
