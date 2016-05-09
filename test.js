'use strict';

require('mocha');
var assert = require('assert');
var csv = require('./');

describe('parse-csv', function() {
  it('should export a function', function() {
    assert.equal(typeof csv, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      csv();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected csv to be a string');
      cb();
    }
  });

  it('should convert a string of csv to a JSON string', function() {
    var str = [
      'id,fruit,vegetable',
      '1,apple,carrot',
      '2,orange,corn',
      '3,banana,potato',
    ].join('\n');
    var expected = [
      '[{"id":"1","fruit":"apple","vegetable":"carrot"},',
      '{"id":"2","fruit":"orange","vegetable":"corn"},',
      '{"id":"3","fruit":"banana","vegetable":"potato"}]',
    ].join('\n');

    var actual = csv(str, {headers: {included: true}});
    assert.equal(actual, expected);
  });
});
