# dawei... because it is da wei

1.0.0 is coming!

the api has stabilized and is pretty solid at this point and I don't forsee any more breaking changes needing to be made.  If that remains the case for a while that's cause for version 1.


Simple and fast state management for React.

Inspired by Zustand and Recoil. without the context or the fluff.

```js
import { createStore } from 'dawei';

const formStore = createStore(/* this can be a value, a function or, nothing */);

// Use them anywhere in your app and they stay synced
const Input = () => {
  const [name, setName] = formStore.use('name');
  const [email, setEmail] = formStore.use('email');

  //  you can get and set deeply nested values too, even if they don't exist
  const [companyName, setCompanyName] = formStore.use('company.name');

  return (
    <form>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input
        value={companyName}
        onChange={e => setCompanyName(e.target.value)}
      />
    </form>
  );
};

function randomBitOfApi() {
  // you can update a bit of state from anywhere
  formStore.set({ saved: true });
}

// you can also subscribe to all changes
let unsubscribe = formStore.subscribe(state => {
  console.log('formStore changed', state);
})

```

## API

### store = createStore(initialState, storeName?: string)
- initialState: Function | Object
  - initial state object or a function that returns initial state
  - (set: DaweiSetter, get: DaweiGetter) => initialState

#### store
- get(selector string | function)
  - get value from the store, can be a pathed string into a nested store, or an accessor function
  - example: (both are equal)
    - `store.get((store) => store.value.wanted)`
    - `store.get('value.wanted')`
- set(value, selector?)
  - set store value, can be any value, it will get merged into the current state
  - value - any value to set
  - selector - primarily used internally for use, can be a selector string similar to get to scope where the set value is to be applied
- [value, setValue] = use(selector string | function)
  - use is a react hook that can be thought of similarly to react.useState(), except it uses a selector instead of a default value
  - selector - the store selector can be a pathed string or an accessor functon
    - example: ( both are equal) string selectors are preferred
      - `store.use(state => state.value.wanted)`
      - `store.use('value.wanted')`
  - returns
    - value - the value referenced by the selector
    - setValue
      > WARNING! slightly different based on type of selector used
      - selector string - returns a scoped setter that will set value at the specified path
      - selector function - returns `store.set`
- subscribe(listener: Function, receiveInitial: boolean)
  - subscribe to all store changes
  - listener(value: store values) - called for every change
  - receiveInitial - whether listener should be called with current state on subscribe
- resolve()
  - mostly used internally or for testing libraries
  - since all set values accept async functions the entire store is promise based and is eventually consistent. chaining on resolve will guarentee that all of the changes made to the store will have settled.
