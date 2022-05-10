interface MergeOptions {
  overwrite?: boolean;
}

function isNumber(s) {
  return parseFloat(s).toString() === s;
}

// integer indices while expanding object will result in arrays being added
// ex: 'test.here.1' will make here an array
export default function chainMerge(obj: any, value: any, path?: string, ops: MergeOptions = {}) {
  if (!path) Object.assign(obj, value);
  let p = path.split('.');
  let cursor = obj;
  let n,
    np = p[0];

  // lock step down tree { cursor: { [n]: { [np] }}}
  while (p.length > 1) {
    [n, np] = p;
    if (!cursor[n]) {
      cursor[n] = isNumber(np) ? [] : {};
    }
    cursor = cursor[n];
    p.shift();
  }

  let intermediateValue = value;
  if (typeof value === 'function') intermediateValue = value(cursor[np]);

  if (ops.overwrite) {
    cursor[np] = intermediateValue;
  } else if (typeof cursor === 'object') {
    if (
      typeof intermediateValue === 'object' &&
      typeof cursor[np] === 'object' &&
      !Array.isArray(intermediateValue)
    ) {
      cursor[np] = { ...cursor[np], ...intermediateValue };
    } else {
      cursor[np] = intermediateValue;
    }
  } else {
    throw `unexpected merge condition`
  }
  return obj;
}
