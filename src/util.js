function getGlobal() {
  if (typeof global !== 'undefined') {
    return global;
  }
  if (typeof GLOBAL !== 'undefined') {
    return GLOBAL;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  return null;
}


function startsWith(str, prefix) {
  return str.lastIndexOf(prefix, 0) === 0;
}


function isValidClassName(str) {
  return str !== '' && typeof str === 'string';
}


function isFunction(obj) {
  return typeof obj === 'function';
}


function getOwnEnumKeys(obj) {
  const keys = [];
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
}


function forOwnProps(obj, fn) {
  return Object.getOwnPropertyNames(obj).forEach((key) => fn(obj[key], key, obj));
}


function forEnumProps(obj, fn) {
  return Object.keys(obj).forEach((key) => fn(obj[key], key, obj));
}


function mapOwnPropsToArray(obj, fn) {
  return Object.getOwnPropertyNames(obj).forEach((key) => fn(obj[key], key, obj));
}


function mapEnumPropsToArray(obj, fn) {
  return Object.keys(obj).map((key) => fn(obj[key], key, obj));
}


export {
  isFunction,
  isValidClassName,
  startsWith,
  getGlobal,
  getOwnEnumKeys,
  forOwnProps,
  forEnumProps,
  mapOwnPropsToArray,
  mapEnumPropsToArray,
};

export default {
  isFunction,
  isValidClassName,
  startsWith,
  getGlobal,
  getOwnEnumKeys,
  forOwnProps,
  forEnumProps,
  mapOwnPropsToArray,
  mapEnumPropsToArray,
};
