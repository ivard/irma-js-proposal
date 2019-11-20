# IRMA core

This package contains the state machine for implementing IRMA flows. You can
register plugins with this state machine and then start the machine:

```javascript
const IrmaCore = require('irma-core');
const irma     = new IrmaCore();

irma.use(pluginA);
irma.use(pluginB);

irma.start();
```

You can pass an options object to the constructor, which will be passed on to
each plugin that you register. Each plugin can choose which of your options to
use or ignore.

```javascript
const irma = new IrmaCore({
  debugging: true,            // Used by state machine and multiple plugins
  element:   '#irma-web-form' // Used by `irma-web` plugin
});
```

The start method starts the state machine and returns a Promise.

```javascript
irma.start()
    .then(result => console.log("Successful disclosure! 🎉", result))
    .catch(error => console.error("Couldn't do what you asked 😢", error));
```
