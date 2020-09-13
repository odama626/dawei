import { createAtom } from '../index';

const expectSubscriptionSequence = (sequence, done) => {
  let values = sequence.slice();
  return value => {
    expect(value).toEqual(values.shift());
    if (!values.length) done?.();
  };
};

it('Async set', done => {
  const asyncAtom = createAtom({});

  asyncAtom.set(() =>
    fetch('https://jsonplaceholder.typicode.com/posts/1').then(response =>
      response.json()
    )
  );

  let expected = [
    {},
    {
      userId: 1,
      id: 1,
      title:
        'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
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
  const atom = createAtom('test');

  let expected = ['test', 'that', 'this', 'sequence', 'is', 'followed'];

  atom.subscribe(expectSubscriptionSequence(expected, done));

  let sequence = Promise.resolve();
  expected
    .slice(1)
    .forEach(value => (sequence = sequence.then(() => atom.set(value))));
});

it('Multiple subscriptions', () => {
  const atom = createAtom('test');

  let expected = ['test', 'that', 'this', 'sequence', 'is', 'followed'];

  let createListener = () =>
    new Promise(resolve => {
      let values = expected.slice();
      atom.subscribe(value => {
        expect(value).toEqual(values.shift());
        if (!values.length) resolve();
      });
    });

  let promises = [
    createListener(),
    createListener(),
    createListener(),
    createListener(),
  ];

  let sequence = Promise.resolve();
  expected
    .slice(1)
    .forEach(value => (sequence = sequence.then(() => atom.set(value))));
  return Promise.all(promises);
});
