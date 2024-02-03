import { createStore } from '../index';

const expectSubscriptionSequence = (sequence, done) => {
  let values = sequence.slice();
  return value => {
    expect(value).toEqual(values.shift());
    if (!values.length) done?.();
  };
};

it('Async set', done => {
  const asyncAtom = createStore();

  asyncAtom.set(() =>
    fetch('https://jsonplaceholder.typicode.com/posts/1').then(response => response.json())
  );

  let expected = [
    {},
    {
      userId: 1,
      id: 1,
      title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
      body:
        'quia et suscipit\n' +
        'suscipit recusandae consequuntur expedita et cum\n' +
        'reprehenderit molestiae ut ut quas totam\n' +
        'nostrum rerum est autem sunt rem eveniet architecto',
    },
  ];

  asyncAtom.subscribe(expectSubscriptionSequence(expected, done));
});

it('Set', done => {
  const atom = createStore('test');

  let expected = ['test', 'that', 'this', 'sequence', 'is', 'followed'];

  atom.subscribe(expectSubscriptionSequence(expected, done));

  let sequence = Promise.resolve();
  expected.slice(1).forEach(value => (sequence = sequence.then(() => atom.set(value))));
});

it('Multiple subscriptions', () => {
  const atom = createStore('test');

  let expected = ['test', 'that', 'this', 'sequence', 'is', 'followed'];

  let createListener = () =>
    new Promise(resolve => {
      let values = expected.slice();
      atom.subscribe(value => {
        expect(value).toEqual(values.shift());
        if (!values.length) resolve();
      });
    });

  let promises = [createListener(), createListener(), createListener(), createListener()];

  let sequence = Promise.resolve();
  expected.slice(1).forEach(value => (sequence = sequence.then(() => atom.set(value))));
  return Promise.all(promises);
});

it('Should handle pathed strings for getters', async () => {
  const atom = createStore('test');

  expect(atom.get()).toEqual('test');
  await atom.set({ this: { is: 'nested' } });
  expect(atom.get('deeply.nested.nonexistant.path')).toEqual(undefined);
  expect(atom.get()).toEqual({ this: { is: 'nested' } });
});

it('should handle root level array slice', async () => {
  const store = createStore([]);

  await store.set(store => ['fish', ...store]);
  expect(store.get()).toEqual(['fish']);

  await store.set(store => store.slice(1));

  expect(store.get()).toEqual([]);
});

it('should handle root level array concat', async () => {
  const store = createStore([]);

  await store.set(store => ['fish', ...store]);
  expect(store.get()).toEqual(['fish']);

  await store.set(store => store.concat('test'));

  expect(store.get()).toEqual(['fish', 'test']);
});

it('should handle root level array to object', async () => {
  const store = createStore([]);

  await store.set(store => ['fish', ...store]);
  expect(store.get()).toEqual(['fish']);

  await store.set(store => ({}));

  expect(store.get()).toEqual({});
});
