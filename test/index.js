import {expect} from 'chai';
import {describe, it} from 'mocha';
import seri, {create, ConfigError} from '../lib';

describe('seri', () => {
  beforeEach(() => {
  });


  describe('default', () => {
    it('JSON compatible', () => {
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

      expect(seri.stringify(obj)).to.equal(JSON.stringify(obj));

      const clone = seri.parse(seri.stringify(obj));
      // Undefined does not get added to the string.
      expect('undefined' in clone).to.be.false;

      clone.undefined = undefined;
      expect(clone).to.not.equal(obj);
      expect(clone).to.eql(obj);
    });


    it('stringify/parse Date', () => {
      const date = new Date();
      const clone = seri.parse(seri.stringify(date));
      expect(clone).to.not.equal(date);
      expect(clone).to.be.an.instanceof(Date);
      expect(clone.getTime()).to.equal(date.getTime());
      expect(clone.toJSON()).to.equal(date.toJSON());
    });


    it('stringify/parse Date in object', () => {
      const date = new Date();
      const obj = {a: [{date}]};
      const clone = seri.parse(seri.stringify(obj)).a[0].date;
      expect(clone).to.not.equal(date);
      expect(clone).to.be.an.instanceof(Date);
      expect(clone.toJSON()).to.equal(date.toJSON());
    });


    it('stringify/parse custom class', () => {
      class A {
        static toJSON = (a) => `${a.a},${a.b}`
        static fromJSON = (json) => new A(...json.split(','))

        constructor(a, b) {
          this.a = a;
          this.b = b;
        }

        equals(o) {
          return o instanceof A && this.a === o.a && this.b === o.b;
        }
      }

      seri.addClass(A);

      const obj = new A('hello', 'world');
      const clone = seri.parse(seri.stringify(obj));
      expect(clone).to.not.equal(obj);
      expect(clone).to.be.an.instanceof(A);
      expect(obj.equals(clone)).to.be.true;

      seri.removeClass(A);


      global.A = A;
      const obj2 = new A('hello', 'world');
      const clone2 = seri.parse(seri.stringify(obj2));
      expect(clone2).to.not.equal(obj2);
      expect(clone2).to.be.an.instanceof(A);
      expect(obj2.equals(clone2)).to.be.true;
      delete global.A;
    });


    it('README XY', () => {
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

      expect(xyClone).to.not.equal(xy);
      expect(xyClone).to.be.an.instanceof(XY);
      expect(xy.equals(xyClone)).to.be.true;

      const xyNestedClone = seri.parse(seri.stringify({xy})).xy;

      expect(xyNestedClone).to.not.equal(xy);
      expect(xyNestedClone).to.be.an.instanceof(XY);
      expect(xy.equals(xyNestedClone)).to.be.true;
      seri.removeClass(XY);
    });

    it('README Nested Class', () => {
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

      seri.addClass(Item);
      seri.addClass(Bag);

      const bag = new Bag([
        new Item('apple'),
        new Item('orange'),
        new Item('3'),
        new Item('[]'),
      ]);

      const bagClone = seri.parse(seri.stringify(bag));

      expect(bagClone).to.be.an.instanceof(Bag);
      expect(bagClone.items).to.be.an.instanceof(Array);
      bagClone.items.forEach((item, i) => {
        expect(item).to.be.an.instanceof(Item);
        expect(item.name).to.equal(bag.items[i].name);
      });

      seri.removeClass(Item);
      seri.removeClass(Bag);
    });
  });


  describe('create', () => {
    it('requires valid stringify', () => {
      expect(() => {
        create({
          stringify: {},
        });
      }).to.throw('stringify');
    });

    it('requires valid parse', () => {
      expect(() => {
        create({
          parse: {},
        });
      }).to.throw('parse');
    });

    it('requires valid parse', () => {
      expect(() => {
        create({
          getPrototypeOf: {},
        });
      }).to.throw('getPrototypeOf');
    });

    it('cannot add anonymous class', () => {
      expect(() => {
        seri.addClass(function() {});
      }).to.throw('name');
    });

    it('cannot remove anonymous class', () => {
      expect(() => {
        seri.removeClass(function() {});
      }).to.throw('name');
    });

    it('cannot overwrite class', () => {
      expect(() => {
        seri.addClass(class A {});
        seri.addClass(class A {});
      }).to.throw('exist');
      seri.removeClass(class A {});
    });

    it('cannot remove unregistered class', () => {
      expect(() => {
        seri.removeClass(class A {});
      }).to.throw('exist');
    });

    it('creates a custom seri', () => {
      const mySeri = create();

      expect(mySeri).to.not.equal(seri);

      const obj = {
        arr: [{a: 1, b: null}, 3, null, true, false, ['hi']],
        obj: {a: 'hi', 'h_m': {d: []}},
        null: null,
        true: true,
        false: false,
        '': '',
        hi: 'hi',
        1: 1,
        0: 0,
      };

      expect(mySeri.stringify(obj)).to.equal(JSON.stringify(obj));

      const clone = mySeri.parse(mySeri.stringify(obj));
      expect(clone).to.not.equal(obj);
      expect(clone).to.eql(obj);
    });

    it('has its own context', () => {
      const mySeri = create();

      class A {
        static fromJSON = (json) => new A(json);

        constructor(a) {
          this.a = a;
        }

        toJSON() { return this.a; }
      }

      const a = new A('hi');

      mySeri.addClass(A);

      const aClone = mySeri.parse(mySeri.stringify(a));
      expect(aClone).to.be.an.instanceof(A);
      expect(aClone.a).to.equal(a.a);

      expect(() => seri.parse(seri.stringify(a))).to.throw('A');
    });
  });
});
