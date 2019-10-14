const QRCode = require('qrcode');
const prompt = require('./prompt');

module.exports = class IrmaConsole {

  constructor({stateMachine}) {
    this._stateMachine = stateMachine;
  }

  stateChange({newState, oldState, transition, payload}) {
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

  // Works like a charm in a terminal with nodejs.
  // Unfortunately it doesn't render a QR code in the browser console. It
  // outputs SVG instead. Should work™️ according to the manual though :/
  // https://www.npmjs.com/package/qrcode#tostringtext-options-cberror-string
  _renderQRcode(payload) {
    QRCode.toString(JSON.stringify(payload), { type: 'terminal' })
    .then(qrcode => console.log(qrcode));
  }

}
