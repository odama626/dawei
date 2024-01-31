import { useCallback, useEffect, useReducer } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import chainMerge from './chainMerge';
import { DeepIndex, Paths, Expand } from './types';

export { chainMerge };

export function optionalChain<State, Path extends string>(
  obj: State,
  path?: Path
): State | DeepIndex<State, Path> {
  if (!path) return obj;
  let p = path.split('.');
  return p.reduce((result, next) => (result ? result[next] : undefined), obj);
}

const DEV_TOOLS = '__REDUX_DEVTOOLS_EXTENSION__';

type Selector<State, Path extends string> = ((State) => any) | DeepIndex<State, Path>;

export type DaweiGetter<State, Path extends string> = (
  selector?: Selector<State, Path>
) => Path extends Function ? any : DeepIndex<State, Path>;

interface DaweiSetterOptions {
  overwrite: boolean;
}

declare function get<State, Result>(selector: (state: State) => Result): Result;
declare function get<State, Path extends string = string>(selector: Path): DeepIndex<State, Path>;

export interface DaweiState<State> {
  listeners: Function[];
  value: any;
  subscribe: (listener: Function, receiveInitial?: boolean) => () => void;
  get: typeof get;
  set(update, path?: Paths<State>, options?: Expand<DaweiSetterOptions>);
  use: typeof get;
  resolve: () => Promise<void>;
}

type InitialStateFunction<State> = (
  set: DaweiState<State>['set'],
  get: DaweiState<State>['get']
) => State;

const passthrough = e => e;

export function createStore<State extends {}>(
  initialState: InitialStateFunction<State> | State,
  storeName?: string
) {
  let listeners: Function[] = [];
  let value: State = (initialState as State) ?? {};
  let sync: Promise<any> = Promise.resolve();

  function debounce(callback, delay) {
    let timeout;
    let paths: any = [];
    let resolves: Function[] = [];
    return async function (path) {
      clearTimeout(timeout);
      paths.push(path);
      timeout = setTimeout(() => {
        unstable_batchedUpdates(() => {
          paths.forEach(path => callback(path));
          paths = [];
          resolves.forEach(resolve => resolve());
          resolves = [];
        });
      }, delay);
      return new Promise(resolve => resolves.push(resolve));
    };
  }

  let updateListeners = debounce(path => listeners.forEach(listener => listener(value, path)), 0);
  let set = async (update, path?: string, { overwrite = false } = {}) => {
    let result = update;
    let pathedValue = optionalChain(value, path);

    if (path && typeof value !== 'object') {
      throw new Error('Cannot path into store when store is not an object');
    }

    if (typeof update === 'function') result = update(pathedValue, value);
    if (result instanceof Promise) result = await Promise.resolve(result);
    if (result !== pathedValue) {
      if (typeof value === 'object') {
        if (path) {
          chainMerge(value, result, path, { overwrite });
        } else {
          Object.assign(value, result);
        }
      } else {
        value = result;
      }
      return updateListeners(path);
    }
  };

  async function setInOrder(update, path?: Paths<State>, options?: Expand<DaweiSetterOptions>) {
    await (sync = sync.then(
      () => set(update, path, options),
      () => set(update, path, options)
    ));
  }

  function get<Result>(selector: (state: State) => Result): Result;
  function get<Path extends string = string>(selector: Path): DeepIndex<State, Path>;
  function get(selector: string | ((state: State) => any) = passthrough) {
    if (typeof selector === 'string') return optionalChain(value, selector);
    return selector(value);
  }

  let atom = {
    listeners,
    get value() {
      return value;
    },
    set value(v) {
      value = v;
    },
    subscribe: (listener, receiveInitial = true) => {
      let index = listeners.push(listener);
      receiveInitial && Promise.resolve().then(() => listener(value));
      return () => {
        listeners.splice(index - 1, 1);
      };
    },
    get,
    set: setInOrder,
    use: passthrough,
    resolve: () => Promise.resolve(sync).then(passthrough, passthrough),
  };

  if (typeof initialState === 'function') {
    value = (initialState as InitialStateFunction<State>)(atom.set, atom.get);
  }

  atom.use = function Use(selector = passthrough) {
    const forceUpdate = useReducer(c => c + 1, 0)[1];
    useEffect(() => {
      let wrap: Function = forceUpdate;
      if (typeof selector === 'string') {
        wrap = (value, path) => {
          if (!path || path.includes(selector)) {
            forceUpdate();
          }
        };
      }
      return atom.subscribe(wrap, false);
    }, [selector]);

    let stringSetter = useCallback(value => atom.set(value, selector), [selector]);
    return [atom.get(selector), typeof selector === 'string' ? stringSetter : atom.set];
  };

  // Setup redux debugger
  if ('window' in global) {
    if (DEV_TOOLS in window) {
      const devtoolsSymbol = Symbol('@@DEVTOOLS');
      let logger = (window[DEV_TOOLS] as any).connect({
        name: `${document.title} - ${storeName || 'Dawei'}`,
        value,
        features: { dispatch: false },
      });
      logger.init(value);
      listeners.push((update, path) => {
        if (path === devtoolsSymbol) return;
        logger.send({ type: path }, update);
      });
      logger.subscribe(message => {
        if (message.type === 'DISPATCH' && message.state) {
          try {
            value = JSON.parse(message.state);
          } catch (e) {}
          updateListeners(devtoolsSymbol);
        }
      });
    }
  }

  return atom;
}
