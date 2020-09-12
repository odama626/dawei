const { createSharedState, createSharedStore, atom } = require("./sharedState");

export const testState = createSharedState("default value");

export const useTestStore = createSharedStore((set, get) => ({
  count: 0,
  countText: () => Number(get().count).toLocaleString("en"),
  increment: () => set({ count: get().count + 1 }),
  decrement: () => set({ count: get().count - 1 })
}));

export const textAtom = atom("hello");
export const uppercaseAtom = atom((get) => get(textAtom).toUpperCase());
export const lowercaseAtom = atom((get) => get(uppercaseAtom).toLowerCase());
