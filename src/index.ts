import { useState, useEffect } from 'react';

interface DaweiState {
  listeners: Function[];
  value: any;
  subscribe: (listener: Function) => () => void;
  get: (selector?: Function) => any;
  set: Function | any;
  use?: (selector?: Function) => any;
}

export function create(callback, type) {
  let listeners: Function[] = [];
  let value = callback;
  let sync = Promise.resolve();

  let updateListeners = () => listeners.forEach(listener => listener(value));
  let set = async update => {
    let result = update;
    if (typeof update === 'function')
      result = update(value);
    result = await Promise.resolve(result);
    if (result !== value) {
      if (typeof value === 'object') {
        Object.assign(value, result);
      } else {
        value = result;
      }
      updateListeners();
    }
  };

  let setInOrder = update => sync = sync.then(() => set(update));

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
    subscribe: listener => {
      let index = listeners.push(listener);
      Promise.resolve().then(() => listener(value));
      return () => {
        listeners.splice(index - 1, 1);
      };
    },
    get: (selector = e => e) => selector(value),
    set: setInOrder,
    use: e => e,
  };

  atom.use = function Use(selector = e => e) {
    const [, setValue] = useState();
    useEffect(() => {
      const wrap = () => setValue(s => !s);
      return atom.subscribe(wrap);
    }, []);

    return [selector(atom.value), atom.set];
  };

  return atom;
}

export const createAtom = callback => create(callback, 'atom');
export const createStore = callback => create(callback, 'store');
