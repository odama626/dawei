# dawei... because it is da wei

<a href="https://www.npmjs.com/package/dawei">
  <img src="https://img.shields.io/npm/v/dawei" alt="npm" />
</a>

Warning! for concurrent react must use version >= 0.14.0

versions less 0.14.0 can fail due to the way forceUpdate was written

the api has stabilized and is pretty solid at this point and I don't forsee any more breaking changes needing to be made. If that remains the case for a while that's cause for version 1.

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
      <input value={companyName} onChange={e => setCompanyName(e.target.value)} />
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
});
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

### Changelog

Version 0.17.0
fix: when the root was an array changes were incorrect, arrays now use assignment at root instead of Object.assign()

Version 0.16.0
feature: basic typings on use

Version 0.15.0
feature: basic inferred types on get based on intial store creation
chore: switched to using pnpm for development

Version 0.11.0

chainMerge was rewritten to better handle pathing into arrays and now treats all numeric values in paths as array indexes

fixes a bug in version 0.10.0-alpha where promises had to be wrapped in functions

```js
// {"arr":[]}
store.set({ test: 'through array' }, 'arr.0.test.1.ok');
//old chainMerge
// {"arr":[{"test":{"1":{"ok":{"test":"through array"}}}}]}

// new chainMerge
// {"arr":[{"test":[null,{"ok":{"test":"through array"}}]}]}
```

Version 0.10.0-alpha

This release makes use of unstable_batchedUpdates from react-dom to limit the number of rerenders that happen from making changes. This release also works slightly differently, it will merge synchronously if the update is a function
