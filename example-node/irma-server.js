const IrmaCore       = require('irma-core');
const IrmaConsole    = require('irma-console');
const IrmaIrmaServer = require('irma-irmaserver');

const irma = new IrmaCore();

irma.use(IrmaConsole);
irma.use(IrmaIrmaServer);

irma.start('http://localhost:8088', {
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [ "pbdf.pbdf.email.email" ]
    ]
  ]
})
.then(result => {
  console.log("Successful disclosure! 🎉");
  console.log(result)
});
