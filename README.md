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
  const [email, setEmail] = formState.use('email');

  //  you can get and set deeply nested values too, even if they don't exist
  const [companyName, setCompanyName] = formState('company.name');

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
let unsubscribe = formState.subscribe(state => {
  console.log('formState changed', state);
})

```
