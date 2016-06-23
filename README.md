# seri
[![Build Status](https://travis-ci.org/joonhocho/seri.svg?branch=master)](https://travis-ci.org/joonhocho/seri)
[![Coverage Status](https://coveralls.io/repos/github/joonhocho/seri/badge.svg?branch=master)](https://coveralls.io/github/joonhocho/seri?branch=master)
[![npm version](https://badge.fury.io/js/seri.svg)](https://badge.fury.io/js/seri)
[![Dependency Status](https://david-dm.org/joonhocho/seri.svg)](https://david-dm.org/joonhocho/seri)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)

JavaScript serializer / deserializer for modern apps that can serialize and deserialize custom classes.


### Install
```
npm install --save seri
```


### Usage

#### Basic
```javascript
import seri from 'seri';

const serializedString = seri.stringify(obj);

const deserializedObject = seri.parse(obj);
```

#### Plain JS Objects
```javascript
// Plain JS object.
const obj = {
  arr: [{a: 1, b: null}, 3, null, true, false, ['hi']],
  obj: {a: 'hi', 'h_m': {d: []}},
  undefined: undefined,
  null: null,
  true: true,
  false: false,
  '': '',
  hi: 'hi',
  1: 1,
  0: 0,
};

// It generates same serialized string as JSON.stringify
// for plain JS objects.
seri.stringify(obj) === JSON.stringify(obj);
```

#### Date Support
```javascript
const date = new Date();
const dateClone = seri.parse(seri.stringify(date));

// It is a Date instance.
dateClone instanceof Date;

// Not the same instance.
date !== dateClone;

// But, new instance with the same value.
date.toJSON() === dateClone.toJSON();
```

#### Nested Date
```javascript
const date = new Date();

// Nested deep in object.
const obj = {a: [{b: date}]};

const objClone = seri.parse(seri.stringify(obj));
const dateClone = objClone.a[0].b;

// Class instances can be nested anywhere you want.
// You will get it back just like that.
dateClone instanceof Date;
```

#### Custom Classes
```javascript
class XY {
  // Simply provide `toJSON` and `fromJSON`.
  static toJSON = ({x, y}) => `${x},${y}`
  static fromJSON = (json) => new XY(...json.split(',').map(Number))

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(o) {
    return o instanceof XY &&
      this.x === o.x &&
      this.y === o.y;
  }
}

// Register to seri.
seri.addClass(XY);

const xy = new XY(5, 3);
const xyClone = seri.parse(seri.stringify(xy));

// Is an instance of XY
xyClone instanceof XY;

// Not the same instance.
xy !== xyClone;

// But, new instance with the same data.
xy.equals(xyClone);


// Also, can be nested.
const xyNestedClone = seri.parse(seri.stringify({xy})).xy;

// Cool!
xy.equals(xyClone);
```

#### Nested Custom Classes
```javascript
class Item {
  static fromJSON = (name) => new Item(name)

  constructor(name) {
    this.name = name;
  }

  toJSON() {
    return this.name;
  }
}

class Bag {
  static fromJSON = (itemsJson) => new Bag(seri.parse(itemsJson))

  constructor(items) {
    this.items = items;
  }

  toJSON() {
    return seri.stringify(this.items);
  }
}

// register classes
seri.addClass(Item);
seri.addClass(Bag);


const bag = new Bag([
  new Item('apple'),
  new Item('orange'),
]);


const bagClone = seri.parse(seri.stringify(bag));


// validate
bagClone instanceof Bag;

bagClone.items[0] instanceof Item;
bagClone.items[0].name === 'apple';

bagClone.items[1] instanceof Item;
bagClone.items[1].name === 'orange';
```


### How it works
It uses `class.prototype.toJSON` or `class.toJSON` to get JSON string for an object and compose it with its class name.

Here's how it's structured:
```javascript
JSON.stringify({
  // `<5Er1]` is a magic key for class name.
  // `<Seri>`
  '<5Er1]': ${className},

  // `p` is for a payload.
  // `obj.toJSON()` or `class.toJSON(obj)`.
  'p': ${json}
});
```

Here's an example with `Date`:
```javascript
seri.stringify(new Date());

// '{"<5Er1]":"Date","p":"2016-06-23T22:01:47.974Z"}'
```


### LICENSE
```
The MIT License (MIT)

Copyright (c) 2016 Joon Ho Cho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
