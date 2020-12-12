import { useEffect, useState } from 'react';

export function optionalChain(obj: any, path?: string) {
  if (!path) return obj;
  let p = path.split('.');
  return p.reduce((result, next) => (result ? result[next] : undefined), obj);
}

export function optionalChainMerge(obj: any, value: any, path?: string) {
  if (!path) return obj;
  let p = path.split('.');
  let key = p.pop() || '';
  let node = p.reduce(
    (result, next) => (result ? result[next] : undefined),
    obj
  );
  if (typeof node[key] === 'object') {
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
  use: (selector?: Function) => any;
}

export function create(callback, type) {
  let listeners: Function[] = [];
  let value = callback;
  let sync = Promise.resolve();

  let updateListeners = () => listeners.forEach(listener => listener(value));
  let set = async (update, path?: string) => {
    let result = update;
    let pathedValue = optionalChain(value, path);

    if (path && typeof value !== 'object') {
      throw new Error('Cannot path into store when store is not an object');
    }

    if (path) {
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
      updateListeners();
    }
  };

  let setInOrder = (update, path?: string) =>
    (sync = sync.then(
      () => set(update, path),
      () => set(update, path)
    ));

  if (typeof callback === 'function') {
    let get = atom => {
      if (!atom) return value;
      if (atom && type === 'store')
        console.warn(
          'you cannot get Atoms inside of a Store. use atom.subscribe() instead'
        );
      atom.listeners.push(() => {
        let newValue = callback(() => atom.value, set);
        if (newValue !== value) {
          setInOrder(() => newValue);
        }
      });
      return atom.value;
    };

    value = callback(get, setInOrder);
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

    if (typeof selector === 'string') {
      return [
        optionalChain(atom.value, selector),
        value => atom.set(value, selector),
      ];
    }

    if (Array.isArray(selector)) {
      let values: any[] = [];
      let setters: any[] = [];
      selector.forEach(select => {
        values.push(optionalChain(atom.value, select));
        setters.push(value => atom.set(value, select));
      });
      return [values, setters];
    }

    return [selector(atom.value), atom.set];
  };

  return atom;
}

export const createAtom = callback => create(callback, 'atom');
export const createStore = callback => create(callback, 'store');
