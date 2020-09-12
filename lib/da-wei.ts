import { useState, useEffect } from 'react';

export function create(callback, type) {
  let listeners = [];
  let value = callback;

  let updateListeners = () => listeners.forEach(listener => listener(value));
  let set = update => {
    let result = update;
    if (typeof update === 'function') result = update(value);
    if (result !== value) {
      if (typeof value === 'object') {
        Object.assign(value, result);
      } else {
        value = result;
      }
      updateListeners();
    }
  };

  if (typeof callback === 'function') {
    let get = atom => {
      if (!atom) return value;
      if (atom && type === 'store')
        console.warn('you cannot get Atoms inside of a Store. use atom.subscribe() instead');
      atom.listeners.push(() => {
        let newValue = callback(() => atom.value, set);
        if (newValue !== value) {
          set(() => newValue);
        }
      });
      return atom.value;
    };

    value = callback(get, set);
  }

  let atom = {
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
      return () => listeners.splice(index - 1, 1);
    },
    get: (selector = e => e) => selector(value),
    set
  };

  atom.use = (selector = e => e) => {
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
