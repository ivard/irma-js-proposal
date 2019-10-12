const IrmaCore       = require('irma-core');
const IrmaConsole    = require('irma-console');
const IrmaNutsAuth   = require('irma-nuts-auth');

const irma = new IrmaCore();

irma.use(IrmaConsole);
irma.use(IrmaNutsAuth);

irma.start('http://localhost:21323', {
  type: "BehandelaarLogin",
  language: "NL",
  version: "v1"
})
.then(result => {
  console.log("Successful disclosure! 🎉");
  console.log(result)
});
