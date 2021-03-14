import { useEffect, useState, useCallback } from 'react';

function optionalChain(obj: any, path?: string) {
  if (!path) return obj;
  let p = path.split('.');
  return p.reduce((result, next) => (result ? result[next] : undefined), obj);
}

function optionalChainMerge(obj: any, value: any, path?: string) {
  if (!path) return obj;
  let p = path.split('.');
  let key = p.pop() || '';
  let node = p.reduce((result, next) => {
    if (!result[next]) result[next] = {};
    return result ? result[next] : undefined;
  }, obj);
  if (typeof node[key] === 'object' && !Array.isArray(value)) {
    node[key] = { ...node[key], ...value };
  } else {
    node[key] = value;
  }
  return obj;
}

export interface DaweiState {
  listeners: Function[];
  value: any;
  subscribe: (listener: Function, receiveInitial?: boolean) => () => void;
  get: (selector?: Function) => any;
  set: Function | any;
  use: (selector?: Function | string) => any;
}

export function createStore(initialState: Function | Object = {}, storeName: string) {
  let listeners: Function[] = [];
  let value = initialState;
  let sync = Promise.resolve();

  let updateListeners = path => listeners.forEach(listener => listener(value, path));
  let set = async (update, path?: string) => {
    let result = update;
    let pathedValue = optionalChain(value, path);

    if (path && typeof value !== 'object') {
      throw new Error('Cannot path into store when store is not an object');
    }

    if (typeof update === 'function') result = update(pathedValue, value);
    result = await Promise.resolve(result);
    if (result !== pathedValue) {
      if (typeof value === 'object') {
        if (path) {
          optionalChainMerge(value, result, path);
        } else {
          Object.assign(value, result);
        }
      } else {
        value = result;
      }
      updateListeners(path);
    }
  };

  let setInOrder = (update, path?: string) =>
    (sync = sync.then(
      () => set(update, path),
      () => set(update, path)
    ));

  if (typeof initialState === 'function') {
    let get = atom => {
      if (!atom) return value;
      atom.listeners.push(() => {
        let newValue = initialState(() => atom.value, set);
        if (newValue !== value) {
          setInOrder(() => newValue);
        }
      });
      return atom.value;
    };

    value = initialState(get, setInOrder);
  }

  // Setup redux debugger
  if ('window' in global) {
    const devtoolsSymbol = Symbol('@@DEVTOOLS');
    if ('__REDUX_DEVTOOLS_EXTENSION__' in window) {
      let logger = window['__REDUX_DEVTOOLS_EXTENSION__'].connect({
        name: `${document.title} - ${storeName || 'Dawei'}`,
        value,
        features: { dispatch: false },
      });
      logger.init(value);
      listeners.push((update, path) => {
        if (path === devtoolsSymbol) return;
        logger.send({ type: path }, update);
      });
      logger.subscribe(message => {
        console.log({ message });
        if (message.type === 'DISPATCH' && message.state) {
          try {
            value = JSON.parse(message.state);
          } catch (e) {}
          updateListeners(devtoolsSymbol);
        }
      });
    }
  }

  let atom: DaweiState = {
    listeners,
    get value() {
      return value;
    },
    set value(v) {
      value = v;
    },
    subscribe: (listener, receiveInitial = true) => {
      let index = listeners.push(listener);
      receiveInitial && Promise.resolve().then(() => listener(value));
      return () => {
        listeners.splice(index - 1, 1);
      };
    },
    get: (selector = e => e) => selector(value),
    set: setInOrder,
    use: e => e,
  };

  atom.use = function Use(selector = e => e) {
    const [, setValue] = useState(false);
    useEffect(() => {
      const wrap = () => setValue(s => !s);
      return atom.subscribe(wrap, false);
    }, []);
    let stringSetter = useCallback(value => atom.set(value, selector), [selector]);

    if (typeof selector === 'string') {
      return [optionalChain(atom.value, selector), stringSetter];
    }

    return [selector(atom.value), atom.set];
  };

  return atom;
}
