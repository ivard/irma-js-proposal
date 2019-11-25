/**
 * This file defines the states for the state machine, plus the different valid
 * transitions to other states from each state.
 *
 * The transition 'fail' is a special one, and will (also) be triggered if we
 * try to apply an invalid transition from that state.
 */

module.exports = {

  startState:       'Uninitialized',

  Uninitialized: {
    initialize:     'Loading',             // Start a new session
    loaded:         'MediumContemplation', // Handle an existing session
    browserError:   'BrowserNotSupported',
    fail:           'Error'
  },

  Loading: {
    loaded:         'MediumContemplation',
    fail:           'Error'
  },

  MediumContemplation: {
    showQRCode:     'ShowingQRCode',
    showIrmaButton: 'ShowingIrmaButton'
  },

  ShowingQRCode: {
    appConnected:   'ContinueOn2ndDevice',
    timeout:        'TimedOut',
    fail:           'Error'
  },

  ContinueOn2ndDevice: {
    succeed:        'Success',
    cancel:         'Cancelled',
    restart:        'Loading',
    timeout:        'TimedOut',
    fail:           'Error'
  },

  ShowingIrmaButton: {
    chooseQR:       'ShowingQRCodeInstead',
    appConnected:   'ContinueInIrmaApp',
    fail:           'Error'
  },

  ShowingQRCodeInstead: {
    appConnected:   'ContinueOn2ndDevice',
    restart:        'Loading',
    timeout:        'TimedOut',
    fail:           'Error'
  },

  ContinueInIrmaApp: {
    succeed:        'Success',
    cancel:         'Cancelled',
    restart:        'Loading',
    timeout:        'TimedOut',
    fail:           'Error'
  },

  Cancelled: {
    restart:        'Loading'
  },

  TimedOut: {
    restart:        'Loading'
  },

  Error: {
    restart:        'Loading'
  },

  // End states
  BrowserNotSupported: {},
  Success: {}

}
