const IrmaCore = require('irma-core');
const Console  = require('irma-console');
const Dummy    = require('irma-dummy');

const irma = new IrmaCore({
  debugging: true,
  dummy: 'happy path'

  // Other options:
  // dummy: 'timeout'
  // dummy: 'cancel'
  // dummy: 'connection error'
  // dummy: 'browser unsupported'
});

irma.use(Console);
irma.use(Dummy);

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
