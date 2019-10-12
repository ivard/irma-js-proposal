// A version of `prompt` that works both in the browser and on the command line.
// Returns a promise in either case.

if ( typeof prompt === "undefined" ) {

  const readline = require('readline');

  module.exports = (message) => {
    return new Promise((resolve, reject) => {
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question(message, (input) => {
          rl.close();
          resolve(input);
        });
      } catch(e) {
        reject(e);
      }
    });
  }

} else {

  module.exports = (message) => {
    return new Promise.resolve(prompt(message));
  };

}
