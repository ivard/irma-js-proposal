const translations = require('./translations');
const Popup        = require('./popup');
const QRCode       = require('qrcode');

module.exports = class IrmaLegacyPopup {

  constructor({stateMachine, options}) {
    this._stateMachine = stateMachine;
    this._option = this._sanitizeOptions(options);

    this._popup = new Popup(translations);
  }

  stateChange({newState, payload}) {
    switch(newState) {
      case 'ShowingQRCode':
      case 'ShowingQRCodeInstead':
        this._popup.setupPopup(payload, 'nl');
        return QRCode.toCanvas(
          document.getElementById('modal-irmaqr'),
          JSON.stringify(payload),
          {width: '230', margin: '1'}
        );
      case 'ContinueOn2ndDevice':
        return this._popup.showConnected();
      case 'Success':
      case 'Error':
      case 'Cancelled':
      case 'TimedOut':
        return this._popup.closePopup();
    }
  }

  _sanitizeOptions(options) {
    return Object.assign({
      // TODO: This should reference the translations, so we can override them
      // from the global options hash
      things: 'values'
    }, options);
  }

};
