                  require('./assets/irma.scss');
const phonePng  = require('./assets/phone.png');
const popupHtml = require('./assets/popup.html');

const browser = typeof(window) !== 'undefined';

const sessionTypeMap = {
  disclosing: 'Verify',
  issuing: 'Issue',
  signing: 'Sign'
};

module.exports = class Popup {

  constructor(translations) {
    this._translations = translations;
  }

  translatePopup(type, lang) {
    this.translatePopupElement('irma-cancel-button', 'Common.Cancel', lang);
    this.translatePopupElement('irma-title', sessionTypeMap[type] + '.Title', lang);
    this.translatePopupElement('irma-text', sessionTypeMap[type] + '.Body', lang);
  }

  translatePopupElement(el, id, lang) {
    window.document.getElementById(el).innerText = this.getTranslatedString(id, lang);
  }

  getTranslatedString(id, lang) {
    const parts = id.split('.');
    let res = this._translations[lang];
    for (const part in parts) {
        if (res === undefined) break;
        res = res[parts[part]];
    }

    // TODO: falling back to defaults shouldn't be done here
    if (res === undefined) {
        res = this._translations['en'];
        for (const part in parts) {
            if (res === undefined) break;
            res = res[parts[part]];
        }
    }

    if (res === undefined) return '';
    else return res;
  }

  setupPopup(qr, language) {
    this.ensurePopupInitialized();
    this.translatePopup(qr.irmaqr, language);
    window.document.getElementById('irma-modal').classList.add('irma-show');
    const cancelbtn = window.document.getElementById('irma-cancel-button');
    cancelbtn.addEventListener('click', () => {
      // fetch(qr.u, {method: 'DELETE'}); // We ignore server errors by not using fetchCheck
      // The popup including the irma-cancel-button element might be reused in later IRMA sessions,
      // so we need to remove this listener. removeEventListener() requires a function reference,
      // which we don't want to have to keep track of outside of setupPopup(), so we do the removing
      // of the listener here inside the listener itself.
      // cancelbtn.removeEventListener('click', del);
      this.closePopup();
    });
  }

  showConnected() {
    canvas = document.getElementById('modal-irmaqr');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = window.devicePixelRatio;
    const canvasSize = 230;
    const imgWidth = 79;
    const imgHeight = 150;
    canvas.width = canvasSize * scale;
    canvas.height = canvasSize * scale;
    ctx.scale(scale, scale);
    const img = new Image();
    img.onload = () => ctx.drawImage(img, (canvasSize-imgWidth)/2, (canvasSize-imgHeight)/2, imgWidth, imgHeight);
    img.src = phonePng;
  }

  closePopup() {
    if (!browser || !window.document.getElementById('irma-modal'))
      return;
    window.document.getElementById('irma-modal').classList.remove('irma-show');
  }

  ensurePopupInitialized() {
    if (!browser || window.document.getElementById('irma-modal'))
      return;

    const popup = window.document.createElement('div');
    popup.id = 'irma-modal';
    popup.innerHTML = popupHtml;
    window.document.body.appendChild(popup);

    const overlay = window.document.createElement('div');
    overlay.classList.add('irma-overlay');
    window.document.body.appendChild(overlay);

    // If we add these elements and then immediately add a css class to trigger our css animations,
    // adding the elements and the css classes get bundled up and executed simultaneously,
    // preventing the css animation from being shown. Accessing offsetHeight forces a reflow in between.
    // https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
    // https://stackoverflow.com/questions/21664940/force-browser-to-trigger-reflow-while-changing-css
    void(popup.offsetHeight); // void prevents Javascript optimizers from throwing away this line
  }

}
