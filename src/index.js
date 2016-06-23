import {
  ConfigError,
  StringifyError,
  ParseError,
} from './errors';
import {
  isFunction,
  isValidClassName,
  getGlobal,
  getOwnKeys,
  forOwnPropNames,
  forKeys,
  mapOwnPropNamesToArray,
  mapKeysToArray,
} from './util';


const CLASS_NAME_KEY = '<5Er1]';


const create = (options = {}) => {
  const glob = options.global || getGlobal();
  if (!glob) {
    throw new ConfigError("'global' must be provided");
  }

  const context = options.context || Object.create(null);

  const JSON = options.JSON || glob.JSON;

  const jsonStringify =
      options.stringify || JSON.stringify || glob.JSON.stringify;
  if (!isFunction(jsonStringify)) {
    throw new ConfigError("'stringify' must be provided");
  }

  const jsonParse =
      options.parse || JSON.parse || glob.JSON.parse;
  if (!isFunction(jsonParse)) {
    throw new ConfigError("'parse' must be provided");
  }

  const getPrototypeOf =
      options.getPrototypeOf || Object.getPrototypeOf ||
      glob.Reflect && glob.Reflect.getPrototypeOf;
  if (!isFunction(getPrototypeOf)) {
    throw new ConfigError("'getPrototypeOf' must be provided");
  }


  const getToJSON = ({name, toJSON}) =>
    toJSON ||
    context[name] && context[name].toJSON ||
    glob[name] && glob[name].toJSON;


  const getFromJSON = ({fromJSON}, name) =>
    fromJSON ||
    context[name] && context[name].fromJSON ||
    glob[name] && glob[name].fromJSON;


  const addClass = (Class) => {
    const {name} = Class;
    if (!isValidClassName(name)) {
      throw new ConfigError("'name' must be provided to serialize custom class.");
    }
    if (name in context) {
      throw new ConfigError(`'${name}' already exists in context.`);
    }
    context[name] = Class;
  };


  const removeClass = ({name}) => {
    if (!isValidClassName(name)) {
      throw new ConfigError("'name' must be provided to serialize custom class.");
    }
    if (!(name in context)) {
      throw new ConfigError(`'${name}' does not exist.`);
    }
    delete context[name];
  };


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
      if (!isValidClassName(name)) {
        throw new StringifyError("'name' must be provided to serialize custom class.");
      }

      let json;
      if (data.toJSON) {
        json = data.toJSON();
      } else {
        const toJSON = getToJSON(constructor);
        if (!toJSON) {
          throw new StringifyError("'class.prototype.toJSON' or 'class.toJSON' must be provided to serialize custom class.");
        }
        json = toJSON(data);
      }
      return jsonStringify({[CLASS_NAME_KEY]: name, p: json});
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
    const props = getOwnKeys(obj)
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
        const {[CLASS_NAME_KEY]: className, p: json} = data;
        if (!className) {
          forOwnPropNames(data, (val, key) => { data[key] = instantiate(val); });
          return data;
        }

        const Class = context[className] || glob[className];
        if (!Class) {
          throw new ParseError(`Could not find '${className}' class.`);
        }

        const fromJSON = getFromJSON(Class, className);
        if (fromJSON) {
          return fromJSON(json);
        }

        if (!isFunction(Class)) {
          throw new ParseError(`'toJSON' must be provided for '${className}' class.`);
        }

        let args = json;
        try { args = parse(json); } catch (e) {}
        return new Class(args);
      }

      if (Array.isArray(data)) {
        return data.map(instantiate);
      }

      // Custom class objects
      return data;
    default:
      throw new ParseError(`Unknown type. ${typeof data}`);
    }
  };

  const parse = (json) => instantiate(jsonParse(json));

  return {
    stringify,
    parse,
    addClass,
    removeClass,
  };
};


let defaultSeri = null;
try { defaultSeri = create(); } catch (e) {}


export {
  defaultSeri as default,
  create,
  ConfigError,
  StringifyError,
  ParseError,
};
