import { useCallback, useEffect, useState } from 'react';

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

const DEV_TOOLS = '__REDUX_DEVTOOLS_EXTENSION__';

export type DaweiGetter = (selector?: Function | string) => any;
export type DaweiSetter = Function | any;
export interface DaweiState {
  listeners: Function[];
  value: any;
  subscribe: (listener: Function, receiveInitial?: boolean) => () => void;
  get: DaweiGetter;
  set: DaweiSetter;
  use: DaweiGetter;
  resolve: () => Promise<void>;
}

const passthrough = e => e;

export function createStore(initialState: Function | Object = {}, storeName?: string) {
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
    get: (selector = passthrough) => {
      if (typeof selector === 'string') return optionalChain(value, selector);
      return selector(value);
    },
    set: setInOrder,
    use: passthrough,
    resolve: () => Promise.resolve(sync).then(passthrough, passthrough),
  };

  if (typeof initialState === 'function') {
    value = initialState(atom.set, atom.get);
  }

  atom.use = function Use(selector = passthrough) {
    const [, setValue] = useState(false);
    useEffect(() => {
      const wrap = () => setValue(s => !s);
      return atom.subscribe(wrap, false);
    }, []);
    let stringSetter = useCallback(value => atom.set(value, selector), [selector]);
    return [atom.get(selector), typeof selector === 'string' ? stringSetter : atom.set];
  };

  // Setup redux debugger
  if ('window' in global) {
    if (DEV_TOOLS in window) {
      const devtoolsSymbol = Symbol('@@DEVTOOLS');
      let logger = window[DEV_TOOLS].connect({
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
        if (message.type === 'DISPATCH' && message.state) {
          try {
            value = JSON.parse(message.state);
          } catch (e) {}
          updateListeners(devtoolsSymbol);
        }
      });
    }
  }

  return atom;
}
