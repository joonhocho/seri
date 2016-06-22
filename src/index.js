import {
  ConfigError,
  StringifyError,
  ParseError,
} from './errors';
import {
  getGlobal,
  getOwnEnumKeys,
  forOwnProps,
  forEnumProps,
  mapOwnPropsToArray,
  mapEnumPropsToArray,
} from './util';


const create = (options = {}) => {
  const glob = options.global || getGlobal();
  if (!glob) {
    throw new ConfigError("'global' must be provided");
  }

  const context = options.context || glob;

  const JSON = options.JSON || glob.JSON;

  const jsonStringify =
      options.stringify || JSON.stringify || glob.JSON.stringify;
  if (typeof jsonStringify !== 'function') {
    throw new ConfigError("'stringify' must be provided");
  }

  const jsonParse =
      options.parse || JSON.parse || glob.JSON.parse;
  if (typeof jsonParse !== 'function') {
    throw new ConfigError("'parse' must be provided");
  }

  const getPrototypeOf =
      options.getPrototypeOf || Object.getPrototypeOf ||
      glob.Reflect && glob.Reflect.getPrototypeOf;
  if (typeof getPrototypeOf !== 'function') {
    throw new ConfigError("'getPrototypeOf' must be provided");
  }

  const getCustomStringify = ({name, stringify}) =>
    stringify || context[name] && context[name].stringify;


  const stringify = (data) => {
    if (!data) {
      return jsonStringify(data);
    }
    switch (typeof data) {
    case 'boolean':
    case 'number':
    case 'string':
      return jsonStringify(data);
    case 'symbol':
      throw new StringifyError(`Symbol cannot be serialized. ${data}`);
    case 'function':
      throw new StringifyError(`Function cannot be serialized. ${data.displayName || data.name || data}`);
    case 'object':
      const {constructor} = data;
      if (!constructor || constructor === Object) {
        return stringifyObject(data);
      }

      if (Array.isArray(data)) {
        return stringifyArray(data);
      }

      // Custom class objects
      const {name} = constructor;
      if (!(name && typeof name === 'string')) {
        throw new StringifyError("'name' must be provided to serialize custom class.");
      }

      let json;
      if (data.toJSON) {
        json = data.toJSON();
      } else {
        const customStringify = getCustomStringify(constructor);
        if (typeof customStringify !== 'function') {
          throw new StringifyError("'class.prototype.toJSON' or 'stringify' must be provided to serialize custom class.");
        }
        json = customStringify(data);
      }
      return jsonStringify({__SERI_CLASS__: name, json});
    default:
      throw new StringifyError(`Unknown type. ${typeof data}`);
    }
  };


  const stringifyProp = (val, key) => {
    const valStr = stringify(val);
    if (valStr) {
      return `"${key}":${valStr}`;
    }
    return '';
  };


  const stringifyObject = (obj) => {
    const props = getOwnEnumKeys(obj)
      .map((key) => stringifyProp(obj[key], key))
      .filter((x) => x)
      .join();
    return `{${props}}`;
  };


  const stringifyArray = (arr) => {
    const items = arr.map((val) => stringify(val)).filter((x) => x);
    if (items.length !== arr.length) {
      // TODO maybe support it manually.
      throw new StringifyError("Array cannot contain 'undefined'.");
    }
    return `[${items}]`;
  };


  const instantiate = (data) => {
    if (!data) {
      return data;
    }
    switch (typeof data) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
    case 'function':
      return data;
    case 'object':
      const {constructor} = data;
      if (!constructor || constructor === Object) {
        const {__SERI_CLASS__, json} = data;
        if (!__SERI_CLASS__) {
          forOwnProps(data, (val, key) => {
            data[key] = instantiate(val);
          });
          return data;
        }
        return new (context[__SERI_CLASS__] || glob[__SERI_CLASS__])(json);
      }

      if (Array.isArray(data)) {
        return data.map(instantiate);
      }

      // Custom class objects
      return data;
    default:
      throw new StringifyError(`Unknown type. ${typeof data}`);
    }
  };


  const parse = (json) => instantiate(jsonParse(json));


  return {
    stringify,
    parse,
  };
};


let defaultSeri = null;
try { defaultSeri = create(); } catch (e) {}


export {
  create,
};

export default defaultSeri;
