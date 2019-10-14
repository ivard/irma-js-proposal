const IrmaCore = require('irma-core');
const Console  = require('irma-console');
const NutsAuth = require('irma-nuts-auth');

const irma = new IrmaCore();

irma.use(Console);
irma.use(NutsAuth);

irma.start('http://localhost:21323', {
  type: "BehandelaarLogin",
  language: "NL",
  version: "v1"
})
.then(result => {
  console.log("Successful disclosure! 🎉");
  console.log(result)
})
.catch(error => {
  console.log("Couldn't do what you asked 😢");
  console.log(error);
});
