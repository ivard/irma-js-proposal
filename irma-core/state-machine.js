const transitions = require('./state-transitions');

module.exports = class StateMachine {

  constructor() {
    this._state     = transitions.startState;
    this._listeners = [];
  }

  addStateChangeListener(func) {
    this._listeners.push(func);
  }

  transition(transition, payload) {
    const oldState = this._state;
    this._state    = this._getNewState(transition);

    this._listeners.forEach(func => func({
      newState:   this._state,
      oldState:   oldState,
      transition: transition,
      payload:    payload
    }));
  }

  _getNewState(transition) {
    let newState = transitions[this._state][transition];
    if (!newState) newState = transitions[this._state]['fail'];
    if (!newState) throw new Error(`Invalid transition '${t}' from state '${this._state}' and could not find a "fail" transition to fall back on.`);
    return newState;
  }

}
