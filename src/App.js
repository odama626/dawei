import React from 'react';
import './styles.css';
import { useSharedState, useAtom } from './sharedState';
import { testState, useTestStore, textAtom, lowercaseAtom, uppercaseAtom } from './store';
import Atomic from './Atomic';

function StateDisplay() {
  const [text, setText] = useSharedState(testState);

  return text;
}

function StateInput() {
  const [text, setText] = useSharedState(testState);
  return <input value={text} onChange={e => setText(e.target.value)} />;
}

function Ticker() {
  const increment = useTestStore(state => state.increment);
  const decrement = useTestStore(state => state.decrement);
  const count = useTestStore(state => state.count);

  return (
    <>
      <button onClick={decrement}>-</button>
      <span style={{ width: '5ch', display: 'inline-block' }}>{count}</span>
      <button onClick={increment}>+</button>
    </>
  );
}

function TickerDisplay() {
  const countText = useTestStore(state => state.countText());

  return countText;
}

function RecoilInput() {
  const [text, setText] = useAtom(textAtom);

  return <input value={text} onChange={e => setText(e.target.value)} />;
}

function RecoilOutput() {
  const [uppercase] = useAtom(uppercaseAtom);
  return <div>Uppercase: {uppercase}</div>;
}

function RecoilLowerOutput() {
  const [lowercase] = useAtom(lowercaseAtom);
  return <div>lowercase: {lowercase} </div>;
}

export default function App() {
  return (
    <div className="App">
      {/* <div style={{ border: '1px solid', padding: '1em' }}>
        <h1>Shared State</h1>
        <StateDisplay />
        <br />
        <StateInput />
      </div>
      <div style={{ border: '1px solid', padding: '1em' }}>
        <h2>Zustand-esque store</h2>
        <Ticker />
        <br />
        <TickerDisplay />
      </div> */}
      <Atomic />
    </div>
  );
}
