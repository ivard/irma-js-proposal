const IrmaCore   = require('irma-core');
const Console    = require('irma-console');
const IrmaServer = require('irma-irmaserver');

const irma = new IrmaCore();

irma.use(Console);
irma.use(IrmaServer);

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
})
.catch(error => {
  console.log("Couldn't do what you asked 😢");
  console.log(error);
});
