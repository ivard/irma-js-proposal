const NutsServer = require('./nuts-server');

module.exports = class IrmaNutsAuth {

  constructor({stateMachine, options}) {
    this._stateMachine = stateMachine;
    this._options      = options;
    this._nutsServer   = new NutsServer(this._options.server);
  }

  stateChange({newState}) {
    switch(newState) {
      case 'Loading':
        return this._startNewSession();
      case 'ShowingQRCode':
      case 'ShowingQRCodeInstead':
        return this._waitForScanning();
      case 'ContinueOn2ndDevice':
        return this._waitForSigning();
    };
  }

  start(session) {
    Object.assign(this._options, {
      session: session
    });

    // If given an already started session, handle that session
    if ( this._options.session ) {
      this._nutsServer.handleSession(this._options.session);
      this._stateMachine.transition('loaded', this._options.session.qr_code_info);
      return;
    }

    // If given a server and a request, start a new session
    if ( this._options.server && this._options.request )
      return this._stateMachine.transition('initialize');
  }

  _startNewSession() {
    this._nutsServer.startSession(this._options.request)
    .then(session => this._stateMachine.transition('loaded', session.qr_code_info))
    .catch(error => {
      console.error(error);
      this._stateMachine.transition('fail');
    });
  }

  _waitForScanning() {
    this._nutsServer.pollUntil('CONNECTED')
    .then(state => this._stateMachine.transition('codeScanned'))
    .catch(error => this._handleUnexpectedServerStates(error));
  }

  _waitForSigning() {
    this._nutsServer.pollUntil('DONE')
    .then(state => {
      if ( state.proofStatus == 'VALID' )
        this._stateMachine.transition('succeed', state);
      else
        this._stateMachine.transition('fail');
    })
    .catch(error => this._handleUnexpectedServerStates(error));
  }

  _handleUnexpectedServerStates(error) {
    switch(error.status) {
      case 'TIMEOUT':
        return this._stateMachine.transition('timeout');
      case 'ERROR':
        return this._stateMachine.transition('fail');
      case 'CANCELLED':
        return this._stateMachine.transition('cancel');
    }

    console.error(error);
  }

}
