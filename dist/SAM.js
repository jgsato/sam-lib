(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.tp = factory());
}(this, function () { 'use strict';

  // ISC License (ISC)
  // Copyright 2019 Jean-Jacques Dubray

  // Permission to use, copy, modify, and/or distribute this software for any purpose
  // with or without fee is hereby granted, provided that the above copyright notice
  // and this permission notice appear in all copies.

  // THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  // REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
  // FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT,
  // OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA
  // OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
  // ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.


  // Optional chaining implementation
  const O = (val, value = {}) => (val && (typeof val === 'object') ? val : value);
  const A = (val, value = []) => (val && Array.isArray(val) ? val : value);
  const S = (val, value = '') => (val && (typeof val === 'string') ? val : value);
  const N = (val, value = 0) => (Number.isNaN(val) ? value : val);
  const NZ = (val, value = 1) => (val === 0 || Number.isNaN(val) ? value === 0 ? 1 : value : val);
  const F = (f, f0 = () => null) => (f || f0);

  // Util functions often used in SAM implementations
  const first = (arr = []) => arr[0];
  const or = (acc, current) => acc || current;
  const and = (acc, current) => acc && current;
  const match = (conditions, values) => first(conditions.map((condition, index) => (condition ? values[index] : null)).filter(e));
  const step = () => ({});
  const wrap = (s, w) => m => s(w(m));

  const e = value => (Array.isArray(value)
    ? value.map(e).reduce(and, true)
    : value === true || (value !== null && value !== undefined));

  const i = (value, element) => {
    switch (typeof value) {
      case 'string': return typeof element === 'string' && value.includes(element)
      case 'object': return Array.isArray(value)
        ? value.includes(element)
        : typeof element === 'string' && e(value[element])
    }
    return value === element
  };

  const E = (value, element) => (e(value) && e(element)
    ? i(value, element)
    : e(value));

  const oneOf = (value, f, guard = true) => {
    e(value) && guard && f(value);
    return mon(e(value))
  };

  const on = (value, f, guard = true) => {
    e(value) && guard && f(value);
    return { on }
  };

  const mon = (triggered = true) => ({
    oneOf: triggered ? () => mon() : oneOf
  });

  const clone = (state) => {
    const comps = state.__components;
    delete state.__components;
    const cln = JSON.parse(JSON.stringify(state));
    if (comps) {
      cln.__components = []; 
      if (comps.length > 0) {
        comps.forEach((c) => {
          delete c.parent;
          cln.__components.push(Object.assign(clone(c), { parent: cln }));
        });
      }
    }
    return cln
  };

  var timetraveler = (h = [], options = {}) => (function () {
    let currentIndex = 0;
    const history = h;
    const { max } = options;

    return {
      snap(state, index) {
        const snapshot = clone(state);
        if (index) {
          history[index] = snapshot;
        } else {
          history.push(snapshot);
          if (max && history.length > max) {
            history.splice(0, 1);
          }
        }
        return state
      },

      travel(index = 0) {
        currentIndex = index;
        return history[index]
      },

      next() {
        return history[currentIndex++]
      },

      hasNext() {
        return E(history[currentIndex])
      },

      last() {
        currentIndex = history.length - 1;
        return history[currentIndex]
      }
    }
  }());

  const ModelClass = function (name) {
    this.__components = {};
    this.__behavior = [];
    this.__name = name;
    this.__lastProposalTimestamp = 0;
  };

  ModelClass.prototype.localState = function (name) {
    return E(name) ? this.__components[name] : {}
  };

  ModelClass.prototype.hasError = function () {
    return E(this.__error)
  };

  ModelClass.prototype.error = function () {
    return this.__error || undefined
  };

  ModelClass.prototype.errorMessage = function () {
    return O(this.__error).message
  };

  ModelClass.prototype.clearError = function () {
    return delete this.__error
  };

  // ISC License (ISC)

  // This is an implementation of SAM using SAM's own principles
  // - SAM's internal model
  // - SAM's internal acceptors
  // - SAM's present function

  function createInstance (options = {}) {
    const { max } = O(options.timetravel);
    const { hasAsyncActions = true, instanceName = 'global' } = options;

    // SAM's internal model
    let intents;
    let history;
    let model = new ModelClass(instanceName);
    const mount = (arr = [], elements = [], operand = model) => elements.map(el => arr.push(el(operand)));
    const acceptors = [
      ({ __error }) => {
        if (__error) {
          model.__error = __error;
        }
      }
    ];
    const reactors = [
      () => {
        model.__hasNext = history ? history.hasNext() : false;
      }
    ];
    const naps = [];
    let logger;

    // ancillary
    let renderView = () => null;
    let _render = () => null;
    let storeRenderView = _render;
    const react = r => r();
    const accept = proposal => a => a(proposal);
    // eslint-disable-next-line arrow-body-style
    const stringify = (s, pretty) => {
      return (pretty ? JSON.stringify(s, null, 4) : JSON.stringify(s))
    };

    // Model

    // State Representation
    const state = () => {
      try {
        // Compute state representation
        reactors.forEach(react);

        // render state representation (gated by nap)
        if (!naps.map(react).reduce(or, false)) {
          renderView(model);
        }
      } catch (err) {
        setTimeout(present({ __error: err }), 0);
      }
    };

    const display = (json = {}, pretty = false) => {
      const keys = Object.keys(json);
      return `${keys.map((key) => {
      if (typeof key !== 'string') {
        return ''
      }
      return key.indexOf('__') === 0 ? '' : stringify(json[key], pretty)
    }).filter(val => val !== '').join(', ')
    }`
    };


    const storeBehavior = (proposal) => {
      if (E(proposal.__name)) {
        const actionName = proposal.__name;
        delete proposal.__name;
        const behavior = model.__formatBehavior
          ? model.__formatBehavior(actionName, proposal, model)
          : `${actionName}(${display(proposal)}) ==> ${display(model)}`;
        model.__behavior.push(behavior);
      }
    };

    const present = (proposal, privateState) => {
      if (proposal.__startTime) {
        if (proposal.__startTime <= model.__lastProposalTimestamp) {
          return
        }
        proposal.__startTime = model.__lastProposalTimestamp;
      }
      // accept proposal
      acceptors.forEach(accept(proposal));

      storeBehavior(proposal);

      // Continue to state representation
      state();
    };

    // SAM's internal acceptors
    const addInitialState = (initialState = {}) => {
      Object.assign(model, initialState);
      if (history) {
        history.snap(model, 0);
      }
      model.__behavior = [];
    };

    // eslint-disable-next-line no-shadow
    const rollback = (conditions = []) => conditions.map(condition => model => () => {
      const isNotSafe = condition.expression(model);
      if (isNotSafe) {
        logger && logger.error({ name: condition.name, model });
        // rollback if history is present
        if (history) {
          model = history.last();
          renderView(model);
        }
        return true
      }
      return false
    });

    // add one component at a time, returns array of intents from actions
    const addComponent = (component = {}) => {
      const { ignoreOutdatedProposals = false, debounce = 0, retry } = component.options || {};

      if (retry) {
        retry.max = retry.max || 1;
        retry.delay = retry.delay || 0;
      }

      // Add component's private state
      if (E(component.name)) {
        model.__components[component.name] = Object.assign(O(component.localState), { parent: model });
        component.localState = component.localState || model.__components[component.name];
      }

      // Decorate actions to present proposal to the model
      if (hasAsyncActions) {
        intents = A(component.actions).map((action) => {
          let needsDebounce = false;
          const debounceDelay = debounce;
          let retryCount = 0;

          const intent = async (...args) => {
            const startTime = new Date().getTime();

            if (debounceDelay > 0 && needsDebounce) {
              needsDebounce = !O(args[0]).__resetDebounce;
              return
            }

            let proposal = {};
            try {
              proposal = await action(...args);
            } catch (err) {
              if (retry) {
                retryCount += 1;
                if (retryCount < retry.max) {
                  setTimeout(() => intent(...args), retry.delay);
                }
                return
              }
              proposal.__error = err;
            }

            if (ignoreOutdatedProposals) {
              proposal.__startTime = startTime;
            }

            try {
              retryCount = 0;
              present(proposal);
            } catch (err) {
              // uncaught exception in an acceptor
              present({ __error: err });
            }

            if (debounceDelay > 0) {
              needsDebounce = true;
              setTimeout(() => intent({ __resetDebounce: true }), debounceDelay);
            }
          };
          return intent
        });
      } else {
        intents = A(component.actions).map(action => (...args) => {
          const proposal = action(...args);
          present(proposal);
        });
      }

      // Add component's acceptors,  reactors, naps and safety condition to SAM instance
      mount(acceptors, component.acceptors, component.localState);
      mount(reactors, component.reactors, component.localState);
      mount(naps, rollback(component.safety), component.localState);
      mount(naps, component.naps, component.localState);
    };

    const setRender = (render) => {
      renderView = history ? wrap(render, history.snap) : render;
      _render = render;
    };

    const setLogger = (l) => {
      logger = l;
    };

    const setHistory = (h) => {
      history = timetraveler(h, { max });
      model.__hasNext = history.hasNext();
      model.__behavior = [];
      renderView = wrap(_render, history.snap);
    };

    const timetravel = (travel = {}) => {
      if (E(history)) {
        if (travel.reset) {
          travel.index = 0;
          model.__behavior = [];
        }
        if (travel.next) {
          model = history.next();
        } else if (travel.endOfTime) {
          model = history.last();
        } else {
          model = history.travel(travel.index);
        }
      }
      renderView(model);
    };

    const setCheck = ({ begin = {}, end }) => {
      const { render } = begin;
      if (E(render)) {
        storeRenderView = renderView;
        renderView = render;
      }

      if (E(end)) {
        renderView = storeRenderView;
      }
    };

    // SAM's internal present function
    return ({
      // eslint-disable-next-line no-shadow
      initialState, component, render, history, travel, logger, check
    }) => {
      intents = [];

      on(history, setHistory)
        .on(initialState, addInitialState)
        .on(component, addComponent)
        .on(render, setRender)
        .on(travel, timetravel)
        .on(logger, setLogger)
        .on(check, setCheck);

      return {
        hasNext: model.__hasNext,
        intents
      }
    }
  }

  // ISC License (ISC)

  const SAM = createInstance();

  // ISC License (ISC)

  // A set of methods to use the SAM pattern
  var api = (SAM$1 = SAM) => ({
    // Core SAM API
    addInitialState: initialState => SAM$1({ initialState }),
    addComponent: component => SAM$1({ component }),
    setRender: render => SAM$1({ render }),
    getIntents: actions => SAM$1({ component: { actions } }),
    addAcceptors: (acceptors, privateModel) => SAM$1({ component: { acceptors, privateModel } }),
    addReactors: (reactors, privateModel) => SAM$1({ component: { reactors, privateModel } }),
    addNAPs: (naps, privateModel) => SAM$1({ component: { naps, privateModel } }),
    addSafetyConditions: (safety, privateModel) => SAM$1({ component: { safety, privateModel } }),

    // Time Travel
    addTimeTraveler: (history = []) => SAM$1({ history }),
    travel: (index = 0) => SAM$1({ travel: { index } }),
    next: () => SAM$1({ travel: { next: true } }),
    last: () => SAM$1({ travel: { endOfTime: true } }),
    hasNext: () => SAM$1({}).hasNext,
    reset: initialState => (initialState ? SAM$1({ initialState }) : SAM$1({ travel: { reset: true } })),

    // Checker
    beginCheck: render => SAM$1({ check: { begin: { render } } }),
    endCheck: () => SAM$1({ check: { end: true } })
  });

  const permutations = (arr, perms, currentDepth, depthMax, noDuplicateAction, doNotStartWith) => {
    const nextLevel = [];
    if (perms.length === 0) {
      arr.forEach((i) => {
        if (doNotStartWith.length > 0) {
          const canAdd = doNotStartWith.map(name => i.name !== name).reduce(and, true);
          canAdd && nextLevel.push([i]);
        } else {
          nextLevel.push([i]);
        }
      });
    } else {
      perms.forEach(p => arr.forEach((i) => {
        const col = p.concat([i]);
        if (noDuplicateAction) {
          if (p[p.length - 1] !== i) {
            nextLevel.push(col);
          }
        } else {
          nextLevel.push(col);
        }
      }));
    }
    currentDepth++;
    if (currentDepth < depthMax) {
      return permutations(arr, nextLevel, currentDepth, depthMax, noDuplicateAction, doNotStartWith)
    }
    return nextLevel.filter(run => run.length === depthMax)
  };

  const prepareValuePermutations = (permutation) => {
    const indexMax = permutation.map(intent => A(O(intent).values).length);

    const modMax = indexMax.map((val, index) => {
      let out = 1;
      for (let j = index; j < indexMax.length; j++) {
        out *= indexMax[j];
      }
      return out
    });

    const increment = currentIndex => modMax.map(
      (m, index) => {
        if (index === modMax.length - 1) {
          return currentIndex % indexMax[index]
        }
        return Math.floor(currentIndex / modMax[index + 1]) % indexMax[index]
      }
    );

    const kmax = indexMax.reduce((acc, val) => acc * val, 1);
    if (kmax === 0) {
      throw new Error(['Checker: invalid dataset, one of the intents values has no value.',
        'If an intent has no parameter, add an empty array to its values'].join('\n'))
    }

    return { increment, kmax }
  };

  const apply = (perms = [], resetState, setBehavior) => {
    perms.forEach((permutation) => {
      let k = 0;
      const { increment, kmax } = prepareValuePermutations(permutation);
      do {
        // Process a permutation for all possible values
        const currentValueIndex = increment(k++);
        const currentValues = permutation.map((i, forIntent) => i.values[currentValueIndex[forIntent]]);
        // return to initial state
        resetState();
        setBehavior([]);

        // apply behavior (intent(...values))
        permutation.forEach((i, forIntent) => i.intent(...currentValues[forIntent]));
      } while (k < kmax)
    });
  };


  const checker = ({
    instance, initialState = {}, intents = [], reset, liveness, safety, options
  }, success = () => null, err = () => null) => {
    const { beginCheck, endCheck } = api(instance);
    const {
      depthMax = 5, noDuplicateAction = false, doNotStartWith = [], format
    } = options;

    const [behaviorIntent, formatIntent] = instance({
      component: {
        actions: [
          __behavior => ({ __behavior }),
          __setFormatBehavior => ({ __setFormatBehavior })
        ],
        acceptors: [
          model => ({ __behavior }) => {
            if (E(__behavior)) {
              model.__behavior = __behavior;
            }
          },
          model => ({ __setFormatBehavior }) => {
            if (E(__setFormatBehavior)) {
              model.__formatBehavior = __setFormatBehavior;
            }
          }
        ]
      }
    }).intents;

    formatIntent(format);

    const behavior = [];

    beginCheck((state) => {
      if (liveness && liveness(state)) {
        // console.log('check check', state)
        behavior.push({ liveness: state.__behavior });
        success(state.__behavior);
      }
      if (safety && safety(state)) {
        behavior.push({ safety: state.__behavior });
        err(state.__behavior);
      }
    });
    apply(
      permutations(intents, [], 0, depthMax, noDuplicateAction, doNotStartWith),
      () => reset(initialState),
      behaviorIntent);
    endCheck();
    return behavior
  };

  // ISC License (ISC)

  const {
    addInitialState, addComponent, setRender, addSafetyConditions,
    getIntents, addAcceptors, addReactors, addNAPs
  } = api();

  var index = {
    // Constructors
    SAM,
    createInstance,
    api,

    // SAM Core
    addInitialState,
    addComponent,
    addAcceptors,
    addReactors,
    addNAPs,
    addSafetyConditions,
    getIntents,
    setRender,

    // Utils
    step,
    first,
    match,
    on,
    oneOf,
    utils: {
      O, A, N, NZ, S, F, E, or, and
    },
    checker
  };

  return index;

}));
