const IrmaCore = require('irma-core');
const Popup    = require('irma-popup');
const NutsAuth = require('irma-nuts-auth');

// Other options for "back-ends":
const IrmaServer = require('irma-irmaserver');
const Dummy      = require('irma-dummy');

document.getElementById('start-button').addEventListener('click', () => {

  const irma = new IrmaCore({
    debugging: true,
    element:   '#irma-web-form'
  });

  irma.use(Popup);
  irma.use(NutsAuth);

  irma.start('http://localhost:21323', {
    type: "BehandelaarLogin",
    language: "NL",
    version: "v1"
  }).then(result => {
    console.log("Successful disclosure! 🎉");
    console.log(result)
  });

});
