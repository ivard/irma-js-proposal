const IrmaCore   = require('irma-core');
const Console    = require('irma-console');
const IrmaServer = require('irma-irmaserver');

// Other options for "back-ends":
const NutsAuth   = require('irma-nuts-auth');
const Dummy      = require('irma-dummy');

const irma = new IrmaCore({
  debugging: true
});

irma.use(Console);
irma.use(IrmaServer);

irma.start('http://2c0a0532.ngrok.io', {
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
