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
    throw new ConfigError(`'global' must be provided`);
  }

  const context = options.context || glob;

  const JSON = options.JSON || glob.JSON;

  const jsonStringify =
      options.stringify || JSON.stringify || glob.JSON.stringify;
  if (typeof jsonStringify !== 'function') {
    throw new ConfigError(`'stringify' must be provided`);
  }

  const jsonParse =
      options.parse || JSON.parse || glob.JSON.parse;
  if (typeof jsonParse !== 'function') {
    throw new ConfigError(`'parse' must be provided`);
  }

  const getPrototypeOf =
      options.getPrototypeOf || Object.getPrototypeOf ||
      glob.Reflect && glob.Reflect.getPrototypeOf;
  if (typeof getPrototypeOf !== 'function') {
    throw new ConfigError(`'getPrototypeOf' must be provided`);
  }


  const stringify = (obj) => {
    if (!obj) {
      return jsonStringify(obj);
    }
    switch (typeof obj) {
      case 'boolean':
      case 'number':
      case 'string':
        return jsonStringify(obj);
      case 'symbol':
        throw new StringifyError(`Symbol cannot be serialized. ${obj}`);
      case 'function':
        throw new StringifyError(`Function cannot be serialized. ${obj.displayName || obj.name || obj}`);
      case 'object':
        const {constructor} = obj;
        if (!constructor || constructor === Object) {
          return stringifyObject(obj);
        }
        if (Array.isArray(obj)) {
          return stringifyArray(obj);
        }
      default:
        throw new StringifyError(`Unknown type. ${typeof obj}`);
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
  }

  const stringifyArray = (obj) => {
    const items = obj.map((val) => stringify(val)).filter((x) => x);
    if (items.length !== obj.length) {
      // TODO maybe support it manually.
      throw new StringifyError(`Array cannot contain 'undefined'.`);
    }
    return `[${items}]`;
  }


  const parse = (str) => {
  };

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
