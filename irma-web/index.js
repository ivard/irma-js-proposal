const QRCode           = require('qrcode');
const DOMManipulations = require('./dom-manipulations');

module.exports = class IrmaWeb {

  constructor({stateMachine, options}) {
    this._stateMachine = stateMachine;
    this._options      = this._sanitizeOptions(options);

    this._dom = new DOMManipulations(
      document.querySelector(this._options.element),
      this._options.translations
    );
  }

  stateChange({newState, payload}) {
    switch(newState) {
      case 'ContinueInIrmaApp':
        return window.setTimeout(() => this._dom.renderState(newState), 200);
      case 'ShowingQRCode':
      case 'ShowingQRCodeInstead':
        this._dom.renderState(newState)
        return QRCode.toCanvas(
          document.getElementById('irma-web-qr-canvas'),
          JSON.stringify(payload),
          {width: '230', margin: '1'}
        );
      default:
        this._dom.renderState(newState)
    }
  }

  _sanitizeOptions(options) {
    return Object.assign({
      element:     '#irma-web-form',
      showHelper:  false,
      translations: {
        header:    'Inloggen met <i class="irma-web-logo">IRMA</i>',
        helper:    'Kom je er niet uit? Kijk dan eerst eens op <a href="https://privacybydesign.foundation/irma-begin/">de website van IRMA</a>.',
        loading:   'Eén moment alsjeblieft',
        button:    'Open IRMA app',
        qrCode:    'Toon QR code',
        app:       'Volg de instructies in de IRMA app',
        retry:     'Opnieuw proberen',
        back:      'Ga terug',
        cancelled: 'Je hebt ervoor gekozen te weigeren in de IRMA app. Het spijt ons, maar dan kunnen we je niet inloggen',
        timeout:   'Sorry, we hebben te lang niks van je gehoord',
        error:     'Sorry! Er is een fout opgetreden',
        browser:   'Het spijt ons, maar je browser voldoet niet aan de minimale eisen',
        success:   'Gelukt!'
      }
    }, options);
  }

}
