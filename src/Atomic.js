import React from 'react';
import { createStore, createAtom } from '../lib/da-wei';

const textAtom = createAtom('Hello');
const upperCaseAtom = createAtom(get => get(textAtom).toUpperCase());

const store = createStore((get, set) => {
  textAtom.subscribe(text => set({ text }));
  return {
    count: 0,
    text: '',
    increment: () => set({ count: get().count + 1 }),
    decrement: () => set({ count: get().count - 1 })
  };
});

const pluckAtom = createAtom(get => get(store).count);

const UpperCase = () => {
  const [uppercase] = upperCaseAtom.use();
  return <p>{uppercase}</p>;
};

const Input = () => {
  const [text, setText] = textAtom.use();
  return <input value={text} onChange={e => setText(e.target.value)} />;
};

const ComplexStore = () => {
  const [counter] = store.use();

  console.count('render');

  return (
    <div>
      <button onClick={() => counter.decrement()}>-</button>
      <span>{counter.count}</span>
      <button onClick={() => counter.increment()}>+</button>
      <p>Text: {counter.text}</p>
    </div>
  );
};

const Pluck = () => {
  const [pluck] = pluckAtom.use();
  return <p>plucked count {pluck}</p>;
};

export default function Container() {
  return (
    <div style={{ padding: '1em' }}>
      <Input />
      <UpperCase />
      <ComplexStore />
      <Pluck />
    </div>
  );
}
