const IrmaCore     = require('irma-core');
const IrmaWeb      = require('irma-web');
const IrmaNutsAuth = require('irma-nuts-auth');

const irma = new IrmaCore({
  debugging: true,
  element:   '#irma-web-form'
});

irma.use(IrmaWeb);
irma.use(IrmaNutsAuth);

irma.start('http://localhost:21323', {
  type: "BehandelaarLogin",
  language: "NL",
  version: "v1"
}).then(result => {
  console.log("Successful disclosure! 🎉");
  console.log(result)
});
