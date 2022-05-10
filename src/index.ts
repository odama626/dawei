import React, { useCallback, useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import chainMerge from './chainMerge';

export { chainMerge };

export function optionalChain(obj: any, path?: string) {
  if (!path) return obj;
  let p = path.split('.');
  return p.reduce((result, next) => (result ? result[next] : undefined), obj);
}

const DEV_TOOLS = '__REDUX_DEVTOOLS_EXTENSION__';

export type DaweiGetter = (selector?: Function | string) => any;
export type DaweiSetter = Function | any;

interface DaweiSetterOptions {
  overwrite: boolean;
}
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
  let sync: Promise<any> = Promise.resolve();

  function debounce(callback, delay) {
    let timeout;
    let paths: any = [];
    let resolves: Function[] = [];
    return async function (path) {
      clearTimeout(timeout);
      paths.push(path);
      timeout = setTimeout(() => {
        unstable_batchedUpdates(() => {
          paths.forEach(path => callback(path));
          paths = [];
          resolves.forEach(resolve => resolve());
          resolves = [];
        });
      }, delay);
      return new Promise(resolve => resolves.push(resolve));
    };
  }

  let updateListeners = debounce(path => listeners.forEach(listener => listener(value, path)), 0);
  let set = async (update, path?: string, { overwrite = false } = {}) => {
    let result = update;
    let pathedValue = optionalChain(value, path);

    if (path && typeof value !== 'object') {
      throw new Error('Cannot path into store when store is not an object');
    }

    if (typeof update === 'function') result = update(pathedValue, value);
    if (result instanceof Promise) result = await Promise.resolve(result);
    if (result !== pathedValue) {
      if (typeof value === 'object') {
        if (path) {
          chainMerge(value, result, path, { overwrite });
        } else {
          Object.assign(value, result);
        }
      } else {
        value = result;
      }
      return updateListeners(path);
    }
  };

  let setInOrder = (update, path?: string, options?: DaweiSetterOptions) =>
    (sync = sync.then(
      () => set(update, path, options),
      () => set(update, path, options)
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
      let wrap: Function = () => {
        setValue(s => !s);
      };
      if (typeof selector === 'string') {
        wrap = (value, path) => {
          if (!path || path.includes(selector)) {
            setValue(s => !s);
          }
        };
      }
      return atom.subscribe(wrap, false);
    }, [selector]);

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
