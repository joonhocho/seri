const {
  keys,
  getOwnPropertyNames,
  prototype: {
    hasOwnProperty,
  },
} = Object;


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
  const list = [];
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      list.push(key);
    }
  }
  return list;
}


function forOwnProps(obj, fn) {
  return getOwnPropertyNames(obj).forEach((key) => fn(obj[key], key, obj));
}


function forEnumProps(obj, fn) {
  return keys(obj).forEach((key) => fn(obj[key], key, obj));
}


function mapOwnPropsToArray(obj, fn) {
  return getOwnPropertyNames(obj).forEach((key) => fn(obj[key], key, obj));
}


function mapEnumPropsToArray(obj, fn) {
  return keys(obj).map((key) => fn(obj[key], key, obj));
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
