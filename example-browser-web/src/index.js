const IrmaCore     = require('irma-core');
const IrmaWeb      = require('irma-web');
const IrmaServer = require('irma-irmaserver');

const irma = new IrmaCore({
  debugging: true,
  element:   '#irma-web-form'
});

irma.use(IrmaWeb);
irma.use(IrmaServer);

irma.start('http://localhost:8088', {
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [ "pbdf.pbdf.email.email" ]
    ]
  ]
}).then(result => {
  console.log("Successful disclosure! 🎉");
  console.log(result)
});
