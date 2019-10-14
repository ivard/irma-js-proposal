// A version of `prompt` that works both in the browser and on the command line.
// Returns a promise in either case.

module.exports = (message) => {
  if ( typeof prompt === "undefined" ) {
    return new Promise((resolve, reject) => {
      try {
        import('readline').then(readline => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          rl.question(message, (input) => {
            rl.close();
            resolve(input);
          });
        });
      } catch(e) {
        reject(e);
      }
    });
  } else {
    return new Promise.resolve(prompt(message));
  }
}
