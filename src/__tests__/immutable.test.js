// import { createStore } from '../index';

it('', () => {
  expect(true).toBeTruthy()
});

// describe('all changes should be immutable', () => {
//   let state;
//   beforeEach(() => {
//     state = createStore({ a: 1, b: 2, c: { d: 3, e: { f: 4 } } });
//   });

//   it('should change all ancestors when changing', async () => {
//     let old = state.get('c.e.f');
//     await state.set(5, 'c.e.f');
//     expect(old !== state.get('c.e.f')).toBeTruthy();
//   });

//   it('should change all ancestors when changing', async () => {
//     let old = state.get('c.e');
//     await state.set(5, 'c.e.f');
//     expect(old !== state.get('c.e')).toBeTruthy();
//     expect(old.f).toEqual(4);
//     expect(state.get('c.e').f).toEqual(5);
//   });

//   it('should change all ancestors when changing', async () => {
//     let old = state.get('c');
//     await state.set(5, 'c.e.f');
//     expect(old !== state.get('c')).toBeTruthy();
//     expect(old.e.f).toEqual(4);
//     expect(state.get('c').e.f).toEqual(5);
//   });

//   it('should change all ancestors when changing', async () => {
//     let old = state.get();
//     await state.set(5, 'c.e.f');
//     expect(old !== state.get()).toBeTruthy();
//     expect(old.c.e.f).toEqual(4);
//     expect(state.get().c.e.f).toEqual(5);
//   });

//   it('should change all ancestors when changing', async () => {
//     let old = state.get();
//     await state.set(5, 'c.e.f');
//     expect(old !== state.get()).toBeTruthy();
//     expect(old.c.e.f).toEqual(4);
//     expect(state.get().c.e.f).toEqual(5);
//   });

//   it('should change all ancestors when changing', async () => {
//     let old = state.get();
//     await state.set({ funky: 'change'}, 'c.e.f');
//     expect(old !== state.get()).toBeTruthy();
//     expect(old.c.e.f).toEqual(4);
//     expect(state.get().c.e.f).toEqual({ funky: 'change'});
//   });

// });
