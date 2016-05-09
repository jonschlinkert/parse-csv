/*!
 * parse-csv <https://github.com/jonschlinkert/parse-csv>
 *
 * Copyright (c) 2014-2016 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('extend-shallow');
var Renderer = require('./lib/renderer');
var Parser = require('./lib/parser');

/**
 * Expose `csv`
 */

module.exports = csv;

/**
 * Parse a string of CSV to a datagrid and render it using the specified [renderer]().
 * The `.json` renderer is used by default.
 *
 * ```js
 * var str = `
 * id,fruit,vegetable
 * 1,apple,carrot
 * 2,orange,corn
 * 3,banana,potato`;
 *
 * var res = csv(str, {headers: {included: true}});
 * console.log(res);
 * // results in:
 * // [{"id":"1","fruit":"apple","vegetable":"carrot"},
 * // {"id":"2","fruit":"orange","vegetable":"corn"},
 * // {"id":"3","fruit":"banana","vegetable":"potato"}]
 * ```
 * @param {String} `method` The name of the renderer method to use, or a string of CSV. If CSV, the `.json` method will be used.
 * @param {String|Object} `str` String of CSV or options.
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

function csv(method, str, options) {
  if (typeof str !== 'string') {
    options = str;
    str = method;
    method = null;
  }
  if (typeof str !== 'string') {
    throw new TypeError('expected csv to be a string');
  }

  var opts = extend({renderer: 'json'}, options);
  method = method || opts.renderer;

  var parser = new Parser(options);
  var renderer = new Renderer(options);

  var datagrid = parser.parse(str);
  return renderer.render(method, datagrid);
}

/**
 * Parse a string of CSV to a datagrid, format it using one of the `.json*` [renderer]() methods,
 * then parse it back to JSON.
 *
 * ```js
 * var str = `
 * id,fruit,vegetable
 * 1,apple,carrot
 * 2,orange,corn
 * 3,banana,potato`;
 *
 * var res = csv.toJSON('jsonDict', str, {headers: {included: true}});
 * console.log(res);
 * // results in:
 * // { '1': { fruit: 'apple', vegetable: 'carrot' },
 * //   '2': { fruit: 'orange', vegetable: 'corn' },
 * //   '3': { fruit: 'banana', vegetable: 'potato' } }
 * ```
 * @param {String} `method` The name of the renderer method to use, or a string of CSV. If CSV, the `.json` method will be used.
 * @param {String|Object} `str` String of CSV or options.
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

module.exports.toJSON = function(method, str, options) {
  if (typeof str === 'string' && !/^json/.test(method)) {
    throw new Error('a json* renderer must be specified with the .toJSON method');
  }
  return JSON.parse(csv.apply(null, arguments));
};

module.exports.Renderer = Renderer;
module.exports.Parser = Parser;
