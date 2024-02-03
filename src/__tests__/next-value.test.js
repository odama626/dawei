import { getNextValue } from '../getNextValue';

it('should be able to switch root types', () => {
  expect(getNextValue([], {})).toEqual({});
  expect(getNextValue({}, [])).toEqual([]);
  expect(getNextValue(['fish'], [])).toEqual([]);
  expect(getNextValue(1, {})).toEqual({});
  expect(getNextValue({}, 1)).toEqual(1);
  expect(getNextValue('fish', 1)).toEqual(1);
  expect(getNextValue([], 'fish')).toEqual('fish');
});

it('should be able to switch pathed types', () => {
  expect(getNextValue({ a: [] }, {}, 'a')).toEqual({ a: {} });
  expect(getNextValue({ a: {} }, [], 'a')).toEqual({ a: [] });
  expect(getNextValue({ a: ['fish'] }, [], 'a')).toEqual({ a: [] });
  expect(getNextValue({ a: 1 }, {}, 'a')).toEqual({ a: {} });
  expect(getNextValue({ a: {} }, 1, 'a')).toEqual({ a: 1 });
  expect(getNextValue({ a: 'fish' }, 1, 'a')).toEqual({ a: 1 });
  expect(getNextValue({ a: [] }, 'fish', 'a')).toEqual({ a: 'fish' });
});
