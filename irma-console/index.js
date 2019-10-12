const QRCode = require('qrcode');
const prompt = require('./prompt');

module.exports = class IrmaConsole {

  constructor({stateMachine}) {
    this._stateMachine = stateMachine;
  }

  stateChange({newState, oldState, transition, payload}) {
    console.info(`🎰 State change: '${oldState}' → '${newState}' (because of '${transition}')`);

    switch(newState) {
      case 'Cancelled':
        return this._askRetry('Transaction cancelled.');
      case 'TimedOut':
        return this._askRetry('Transaction timed out.');
      case 'Error':
        return this._askRetry('An error occured.');
      case 'ShowingQRCode':
        return this._renderQRcode(payload);
    }
  }

  _askRetry(message) {
    prompt(`${message} Do you want to try again? [Yn]`)
    .then(input => {
      if ( ['y', 'Y', ''].indexOf(input) >= 0 )
        this._stateMachine.transition('restart');
    })
    .catch(e => console.error(e));
  }

  _renderQRcode(payload) {
    QRCode.toString(JSON.stringify(payload), { type: 'terminal' }, (_, qrcode) => {
      console.log(qrcode);
    });
  }

}
