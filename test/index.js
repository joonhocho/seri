import {expect} from 'chai';
import {describe, it} from 'mocha';
import seri from '../lib';

describe('seri', () => {
  beforeEach(() => {
  });


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
  });


  it('stringify/parse Date', () => {
    const date = new Date();
    const clone = seri.parse(seri.stringify(date));
    expect(clone).to.not.equal(date);
    expect(clone).to.be.an.instanceof(Date);
    expect(clone.toJSON()).to.equal(date.toJSON());
  });


  it('stringify/parse Date in object', () => {
    const date = new Date();
    const obj = {date};
    const clone = seri.parse(seri.stringify(obj)).date;
    expect(clone).to.not.equal(date);
    expect(clone).to.be.an.instanceof(Date);
    expect(clone.toJSON()).to.equal(date.toJSON());
  });
});
