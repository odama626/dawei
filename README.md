# dawei... because it is da wei

Simple and fast state management for React.

Inspired by Zustand and Recoil.  without the context or the fluff.

```js
// Create your atoms and derivatives
import { createAtom, createStore } from 'dawei';

const textAtom = createAtom('Hello');
const uppercaseAtom = createAtom(get => get(textAtom).toUpperCase());

// yes you can create stores too
const counterStore = createStore((get, set) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
  decrement: () => set({ count: get().count - 1 })
}));

// Use them anywhere in your app and they stay synced
const Input = () => {
  const [text, setText] = textAtom.use();
  return <input value={text} onChange={(e) => setText(e.target.value)} />
}

const Uppercase = () => {
  const [uppercase] = uppercaseAtom.use();
  return <div>Uppercase: {uppercase}</div>
}
```

![Dawei](dawei-mascot.png)