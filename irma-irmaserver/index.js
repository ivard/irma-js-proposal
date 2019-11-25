const IrmaServer = require('./irma-server');

module.exports = class IrmaJSBackend {

  constructor({stateMachine, options}) {
    this._stateMachine = stateMachine;
    this._options      = options;
  }

  stateChange({newState}) {
    switch(newState) {
      case 'Loading':
        // If session is already started and never completed, finish previous session
        const prevOptions = localStorage.getItem('irmajs-options');
        if (prevOptions !== null) {
          this._options = JSON.parse(prevOptions);
          this._stateMachine.transition('loaded', this._options.sessionPtr);
          return this._waitForScanning();
        }
        return this._startNewSession();
      case 'ContinueOn2ndDevice':
      case 'ContinueInIrmaApp':
        return this._waitForUserAction();
    }
  }

  start(server, request) {
    Object.assign(this._options, {
      server: server,
      request: request
    });

    this._irmaServer = new IrmaServer(server, this._options.debugging);
    this._stateMachine.transition('initialize');
  }

  _startNewSession() {
    this._irmaServer.startSession(this._options.request)
    .then(({sessionPtr, token}) => {
      this._options.sessionPtr = sessionPtr;
      this._options.token = token;
      this._stateMachine.transition('loaded', sessionPtr);
      this._options.irmaState = {};

      // Store session for recovering a session on mobile devices
      localStorage.setItem('irmajs-options', JSON.stringify(this._options));

      this._waitForScanning();
    })
    .catch(error => this._handleUnexpectedServerStates(error)) // TODO: is this right..?
  }

  _waitForScanning() {
    this._irmaServer._setupSession(this._options.sessionPtr, this._options.irmaState, this._options)
    .then(status => {
      this._options.receivedStatus = status;
      this._stateMachine.transition('appConnected');  // TODO: Do we always go here?
    })
    .catch(error => this._handleUnexpectedServerStates(error)) // TODO: is this right?
  }

  _waitForUserAction() {
    this._irmaServer._finishSession(this._options.receivedStatus, this._options.irmaState)
    .then(result => {
      localStorage.removeItem('irmajs-options');
      this._stateMachine.transition('succeed', result);
    })
    .catch(error => this._handleUnexpectedServerStates(error)) // TODO: is this right?
  }

  _handleUnexpectedServerStates(error) {
    localStorage.removeItem('irmajs-options');
    switch(error) {
      case 'CANCELLED':
        // This is a conscious choice by a user.
        return this._stateMachine.transition('cancel');
      case 'TIMEOUT':
        // This is a known and understood error. We can be explicit to the user.
        return this._stateMachine.transition('timeout');
      default:
        // Catch unknown errors and give generic error message. We never really
        // want to get here.
        console.error(error);
        return this._stateMachine.transition('fail');
    }
  }

}
