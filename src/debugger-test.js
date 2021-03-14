import React from 'react';
import ReactDOM from 'react-dom';

import { createStore } from './index.ts';

const basicStore = createStore({ test: 'test-data' }, 'basic store');
const secondStore = createStore({ test: 'test-data' }, 'second store');

function App() {
  const [data, setData] = basicStore.use('data');
  const [nested, setNested] = basicStore.use('deeply.nested.path');

  return (
    <div>
      Data
      <div>
        <code>{JSON.stringify(data, null, 2)}</code>
      </div>
      <button onClick={() => setData(data => ({ key: (data?.key || 0) + 1 }))}>
        Add Data
      </button>
      Nested
      <div>
        <code>{JSON.stringify(nested, null, 2)}</code>
      </div>
      <button onClick={() => setNested(data => ({ key: (data?.key || 0) + 1 }))}>
        Add Nested Data 
      </button>
      <button onClick={() => basicStore.set({ another: { merged: { key: 'ok?'}}})}>Manual Set</button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
