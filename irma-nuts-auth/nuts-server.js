if ( typeof fetch === 'undefined' ) require('isomorphic-fetch');

module.exports = class NutsServer {

  constructor(server) {
    this._server  = server;
    this._session = {};
  }

  startSession(request) {
    return fetch(`${this._server}/auth/contract/session`, {
      method:  'POST',
      mode:    'cors',
      headers: {'Content-Type': 'application/json'},
      body:    JSON.stringify(request),
      cache:   'reload'
    })
    .then(result => {
      if (result.status != 201)
        throw('Error in starting session: Session endpoint returned status other than 201 created');
      return result.json();
    })
    .then(session => {
      this._session = session;
      return Promise.resolve(session);
    });
  }

  handleSession(session) {
    this._session = session;
  }

  pollUntil(targetState) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        fetch(`${this._server}/auth/contract/session/${this._session.session_id}`, {
          method:  'GET',
          mode:    'cors',
          headers: {'Content-Type': 'application/json'},
          cache:   'reload'
        })
        .then(result => {
          if ( result.status != 200 )
            throw('Error in polling: Session endpoint returned status other than 200 OK');
          return result.json();
        })
        .then(state => {
          if ( state.status == targetState ) {
            clearInterval(interval);
            resolve(state);
          }
          // IE11 doesn't support "includes", so do it this way:
          if ( ['TIMEOUT', 'ERROR', 'CANCELLED'].indexOf(state.status) >= 0 ) {
            clearInterval(interval);
            reject(state);
          }
        }).catch((err) => {
          clearInterval(interval);
          reject(err);
        });
      }, 1000);
    });
  }

}
