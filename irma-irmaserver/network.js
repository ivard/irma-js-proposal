if ( typeof fetch === 'undefined' ) require('isomorphic-fetch');

const browser = typeof(window) !== 'undefined';
const EventSource = !browser ? require('eventsource') : undefined;

module.exports = {
  waitStatus,
  fetchCheck
}

function waitStatus(url, status = SessionStatus.Initialized) {
  return new Promise((resolve, reject) => {
    const EvtSource = browser ? window.EventSource : EventSource;
    if (!EvtSource) {
      console.info('No support for EventSource, fallback to polling');
      poller(`${url}/status`, status, resolve, reject);
      return;
    }

    // The EventSource.onopen Javascript callback is not consistently called across browsers (Chrome yes, Firefox+Safari no),
    // but the irmaserver manually sends an "open" event 200 ms after establishing the SSE connection.
    // Cancel and fallback to polling if we don't get that signal (e.g. due to a reverse proxy breaking SSE).
    const source = new EvtSource(`${url}/statusevents`);
    const canceller = setTimeout(() => reject('no open message received'), 500);
    source.onopen = () => {
      clearTimeout(canceller);
    };
    source.onmessage = e => {
      clearTimeout(canceller);
      source.close();
      resolve(JSON.parse(e.data));
    };
    source.onerror = e => {
      clearTimeout(canceller);
      console.error('Received server event error', e);
      source.close();
      reject(e);
    };
  }).catch((e) => {
    console.error('error in server sent event, falling back to polling:', e);
    return pollStatus(`${url}/status`, status);
  });
}

function pollStatus(url, status = SessionStatus.Initialized) {
  return new Promise((resolve, reject) => poller(url, status, resolve, reject));
}

const poller = (url, status, resolve, reject) => {
  return fetchCheck(url)
    .then((response) => response.json())
    .then((text) => text !== status ? resolve(text) : setTimeout(poller, 500, url, status, resolve, reject))
    .catch((err) => reject(err));
};


function handleFetchErrors(response) {
  if (!response.ok) {
    return response.text().then((text) => {
      console.error('Server returned error:', text);
      throw new Error(response.statusText);
    });
  }
  return response;
}

function fetchCheck() {
  return fetch
    .apply(null, arguments)
    .then(handleFetchErrors);
}
