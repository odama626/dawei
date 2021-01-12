import { act, renderHook } from '@testing-library/react-hooks';
import { createStore } from '../index';

function newStore() {
  return createStore({
    name: 'Dawei',
    age: 1,
  });
}

function newComplextStore() {
  return createStore({
    name: 'Dawei',
    age: 1,
    deeply: {
      nested: {
        object: 'test',
      },
    },
  });
}

function newStoreWithArray() {
  return createStore({
    name: 'Dawei',
    arr: [],
  });
}

it('Should render hook', async () => {
  const store = newStore();
  const { result } = renderHook(() => store.use());

  expect(result.current[0]).toEqual({ name: 'Dawei', age: 1 });
});

it('Should handle basic set updates', async () => {
  const store = newStore();
  const { result } = renderHook(() => store.use());

  expect(result.current[0]).toEqual({ name: 'Dawei', age: 1 });

  await act(() => store.set({ age: 2 }));
  expect(result.current[0]).toEqual({ name: 'Dawei', age: 2 });

  await act(() => store.set(state => ({ age: state.age + 5 })));
  expect(result.current[0]).toEqual({ name: 'Dawei', age: 7 });

  await act(() => store.set({ newKey: 'newValue' }));
  expect(result.current[0]).toEqual({
    name: 'Dawei',
    age: 7,
    newKey: 'newValue',
  });
});

it('Should handle basic local set updates', async () => {
  const store = newStore();
  const { result } = renderHook(() => store.use());

  expect(result.current[0]).toEqual({ name: 'Dawei', age: 1 });

  await act(() => result.current[1]({ age: 2 }));
  expect(result.current[0]).toEqual({ name: 'Dawei', age: 2 });

  await act(() => result.current[1](state => ({ age: state.age + 5 })));
  expect(result.current[0]).toEqual({ name: 'Dawei', age: 7 });

  await act(() => result.current[1]({ newKey: 'newValue' }));
  expect(result.current[0]).toEqual({
    name: 'Dawei',
    age: 7,
    newKey: 'newValue',
  });
});

it('Should handle function selectors', async () => {
  const store = newStore();
  const { result } = renderHook(() => store.use(s => s.name));

  expect(result.current[0]).toEqual('Dawei');
  await act(() => result.current[1]({ name: 'the way' }));
  expect(result.current[0]).toEqual('the way');
});

it('Should handle string selectors with pathed setters', async () => {
  const store = newStore();
  const name = renderHook(() => store.use('name')).result;
  const newKey = renderHook(() => store.use('new')).result;

  expect(name.current[0]).toEqual('Dawei');
  await act(() => name.current[1]('Nested set'));
  expect(name.current[0]).toEqual('Nested set');

  expect(newKey.current[0]).toEqual(undefined);
  await act(() => newKey.current[1]({ value: 'test' }));
  expect(newKey.current[0]).toEqual({ value: 'test' });
});

it('Should handle deeply nested updates with pathed selectors', async () => {
  const store = newComplextStore();
  const all = renderHook(() => store.use()).result;
  const obj = renderHook(() => store.use('deeply.nested.object')).result;

  expect(obj.current[0]).toEqual('test');
  await act(() => obj.current[1]({ changed: 'Obj', complex: true }));
  expect(obj.current[0]).toEqual({ changed: 'Obj', complex: true });
  expect(all.current[0]).toEqual({
    name: 'Dawei',
    age: 1,
    deeply: { nested: { object: { changed: 'Obj', complex: true } } },
  });
});

it('Should handle arrays with scoped selectors', async () => {
    const store = newStoreWithArray();
    const { result } = renderHook(() => store.use('arr'));
  
    expect(result.current[0]).toEqual([]);
    await act(() => result.current[1]([1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
    await act(() => result.current[1]([]));
    expect(result.current[0]).toEqual([]);
});