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


function getOwnEnumKeys(obj) {
  const keys = [];
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};


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
  getGlobal,
  getOwnEnumKeys,
  forOwnProps,
  forEnumProps,
  mapOwnPropsToArray,
  mapEnumPropsToArray,
};

export default {
  getGlobal,
  getOwnEnumKeys,
  forOwnProps,
  forEnumProps,
  mapOwnPropsToArray,
  mapEnumPropsToArray,
};
