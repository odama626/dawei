const { useState, useEffect } = require("react");

export function createSharedStore(createStore) {
  let listeners = [];
  let container = { store: {} };
  let set = (update) => {
    container = { store: { ...container.store, ...update } };
    listeners.forEach((listener) => listener((s) => !s));
  };
  let get = () => container.store;

  container.store = createStore(set, get);

  return (selector = (s) => s) => {
    const [, setValue] = useState();

    useEffect(() => {
      let index = listeners.push(setValue);
      return () => listeners.splice(index - 1, 1);
    }, []);
    return selector(get());
  };
}

export function createSharedState(defaultValue) {
  return {
    value: defaultValue,
    listeners: []
  };
}

const updateSharedState = (share) => (update) => {
  let result = update;
  if (typeof update === "function") result = update(share.value);
  if (share.value !== result) {
    share.value = result;
    share.listeners.forEach((listener) => listener((s) => !s));
  }
};

export function useSharedState(share) {
  const [, setValue] = useState();

  useEffect(() => {
    let index = share.listeners.push(setValue);
    return () => share.listeners.splice(index - 1, 1);
  }, []);
  return [share.value, updateSharedState(share)];
}

export function atom(callback) {
  let listeners = [];
  let value = callback;

  if (typeof callback === "function") {
    let init = (atom) => {
      atom.listeners.push(() => {
        let newValue = callback(() => atom.value);
        if (newValue !== value) {
          value = newValue;
          listeners.forEach((listener) => listener((s) => !s));
        }
      });
      return atom.value;
    };
    value = callback(init);
  }

  return {
    listeners,
    get value() {
      return value;
    },
    set value(v) {
      value = v;
    }
  };
}

export function useAtom(atom) {
  return useSharedState(atom);
}
