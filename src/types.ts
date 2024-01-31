type Idx<T, K extends string> = K extends keyof T ? T[K] : never;

// extract the type from a path
export type DeepIndex<State, Path extends string> = State extends object
  ? Path extends `${infer F}.${infer R}`
    ? DeepIndex<Idx<State, F>, R>
    : Idx<State, Path>
  : never;

// resolve all the paths from a state
export type Paths<State> = State extends object
  ? {
      [K in keyof State]: `${Exclude<K, symbol>}${'' | `.${Paths<State[K]>}`}`;
    }[keyof State]
  : never;

// expand the inner type for better tooltips
export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;
