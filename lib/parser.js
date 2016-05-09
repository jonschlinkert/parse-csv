'use strict';

/**
 * Module dependencies
 */

var isNumber = require('is-number');
var extend = require('extend-shallow');
var merge = require('mixin-deep');

/**
 * Decimal regex
 *
 * @type {RegExp}
 */

var decimalRe = /^\s*(\+|-)?((\d+([,\.]\d+)?)|([,\.]\d+))\s*$/;

/**
 * Create a new `Parser` with the given `options`.
 *
 * ```js
 * var csv = require('parse-csv');
 * var parser = new csv.Parser();
 * ```
 * @param {Options} `options`
 * @api public
 */

function Parser(options) {
  this.options = merge({}, {
    headers: {
      included: false,
      downcase: true,
      upcase: true
    },
    delimiter: 'tab',
    decimalSign: 'comma'
  }, options);
}

/**
 * Parse CSV or tab-delimited string into a data-grid formatted JavaScript object.
 *
 * ```js
 * var parser = new Parser();
 *
 * var str = `
 * id,fruit,vegetable
 * 1,apple,carrot
 * 2,orange,corn
 * 3,banana,potato`;
 *
 * var datagrid = parser.parse(str);
 *
 * // results in:
 * // { data:
 * //    [ [ '1', 'apple', 'carrot' ],
 * //      [ '2', 'orange', 'corn' ],
 * //      [ '3', 'banana', 'potato' ] ],
 * //   header:
 * //    { names: [ 'id', 'fruit', 'vegetable' ],
 * //      types: [ '-1': 'string' ] } }
 * ```
 *
 * @param  {String} `str`
 * @param  {Object} `options`
 * @return {Object}
 * @api public
 */

Parser.prototype.parse = function(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  var opts = extend({}, this.options, options);
  var dataArray = [];

  str = str.replace(/(\r|\r\n)/g, '');

  // count the number of commas
  var numCommas = (str.match(/,/g) || []).length;

  // count the number of tabs
  var numTabs = (str.match(/\t/g) || []).length;

  // set delimiter
  var delimiter = ',';

  if (opts.delimiter === 'tab') {
    delimiter = '\t';
  } else if (numTabs > numCommas) {
    delimiter = '\t';
  }

  // strip extra empty lines
  str = str.replace(/^\n+|\n+$/g, '');

  // Create an array of arrays from the given CSV
  dataArray = toArray(str, opts);

  // escape out any tabs or returns or new lines
  for (var i = dataArray.length - 1; i >= 0; i--) {
    for (var j = dataArray[i].length - 1; j >= 0; j--) {
      dataArray[i][j] = dataArray[i][j].replace(/([\t\n])/, '\\$1');
    }
  }

  var headerNames = [];
  var headerTypes = [];

  var numColumns = dataArray[0].length;
  var numRows = dataArray.length;

  if (opts.headers.included) {
    // remove header row
    headerNames = dataArray.splice(0, 1)[0];
    numRows = dataArray.length;

  } else {
    // create generic property names if no header names are specified
    for (var k = 0; k < numColumns; k++) {
      headerNames.push('val' + String(k));
      headerTypes.push('');
    }
  }

  if (opts.headers.upcase) {
    for (var l = headerNames.length - 1; l >= 0; l--) {
      headerNames[l] = headerNames[l].toUpperCase();
    }
  }
  if (opts.headers.downcase) {
    for (var m = headerNames.length - 1; m >= 0; m--) {
      headerNames[m] = headerNames[m].toLowerCase();
    }
  }

  // test all the rows for proper number of columns.
  for (var ii = 0; ii < dataArray.length; ii++) {
    var numValues = dataArray[ii].length;
    if (numValues != numColumns) {
      this.log('Error parsing row ' + String(ii) + '. Wrong number of columns.');
    }
  }

  // test columns for number data type
  var numRowsToTest = dataArray.length;
  var threshold = 0.9;

  for (var iii = 0; iii < headerNames.length; iii++) {
    var numFloats = 0;
    var numInts = 0;
    for (var r = 0; r < numRowsToTest; r++) {
      if (dataArray[r]) {

        // replace comma with dot if comma is decimal separator
        if (opts.decimalSign === 'comma' && decimalRe.test(dataArray[r][iii])) {
          dataArray[r][iii] = dataArray[r][iii].replace(",", ".");
        }
        if (isNumber(dataArray[r][iii])) {
          numInts++;
          if (String(dataArray[r][iii]).indexOf('.') > 0) {
            numFloats++;
          }
        }
      }
    }

    if ((numInts / numRowsToTest) > threshold) {
      if (numFloats > 0) {
        headerTypes[i] = 'float';
      } else {
        headerTypes[i] = 'int';
      }
    } else {
      headerTypes[i] = 'string';
    }
  }

  return {
    data: dataArray,
    header: {
      names: headerNames,
      types: headerTypes
    }
  };
};

/**
 * Parse a delimited string into an array of arrays.
 *
 * The default delimiter is `comma`, this can be
 * overriden by passed a different delimiter on
 * the `delim` option as a second argument.
 *
 * This Function is from [Ben Nadel] by way of [Mr Data Converer]
 *
 * @param  {String} `str`
 * @param  {Object} `options`
 * @return {Array}
 */

function toArray(str, options) {
  var opts = extend({delim: ','}, options);

  // Create a regular expression to parse the CSV values.
  var re = new RegExp(
    // Delimiters.
    '(\\' + opts.delim + '|\\n|^)' +

    // Quoted fields.
    '(?:"([^"]*(?:""[^"]*)*)"|' +

    // Standard fields.
    '([^"\\' + opts.delim + '\\n]*))', 'gi');

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arr = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var match = null;
  var value;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (match = re.exec(str)) {

    // Get the delimiter that was found.
    var matchedDelim = match[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If it does not, then we can expect
    // this delimiter to be a row delimiter.
    if (matchedDelim.length && (matchedDelim != opts.delim)) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arr.push([]);
    }

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (match[2]) {

      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      value = match[2].replace(/""/g, '"');
    } else {

      // We found a non-quoted value.
      value = match[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arr[arr.length - 1].push(value);
  }

  // Return the parsed data.
  return arr;
};

/**
 * Expose `Parser`
 */

module.exports = Parser;
