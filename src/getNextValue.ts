import chainMerge from './chainMerge';

export function getNextValue(cur, next, path, options) {
  if (!path) {
    switch (true) {
      case Array.isArray(cur) || typeof cur !== 'object':
      case Array.isArray(next) || typeof next !== 'object':
        return next;
      default:
        return Object.assign(cur, next);
    }
  }
  return chainMerge(cur, next, path, options);
}
