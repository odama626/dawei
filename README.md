# dawei... because it is da wei

Simple and fast state management for React.

Inspired by Zustand and Recoil. without the context or the fluff.

```js
import { createStore } from 'dawei';

const formStore = createStore({});

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

```
