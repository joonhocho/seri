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
});
