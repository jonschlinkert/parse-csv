# parse-csv [![NPM version](https://img.shields.io/npm/v/parse-csv.svg?style=flat)](https://www.npmjs.com/package/parse-csv) [![NPM downloads](https://img.shields.io/npm/dm/parse-csv.svg?style=flat)](https://npmjs.org/package/parse-csv) [![Build Status](https://img.shields.io/travis/jonschlinkert/parse-csv.svg?style=flat)](https://travis-ci.org/jonschlinkert/parse-csv)

CSV parser for node.js.

## TOC

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  * [Available renderers](#available-renderers)
- [Options](#options)
  * [Parser options](#parser-options)
  * [Renderer options](#renderer-options)
- [Related projects](#related-projects)
- [Contributing](#contributing)
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [License](#license)

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install parse-csv --save
```

Based on [mr-data-converter](https://github.com/shancarter/mr-data-converter) by [@shancarter](https://github.com/shancarter). Copyright (c) 2011 Shan Carter.

## Usage

```js
var csv = require('parse-csv');

var str = [
  'id,fruit,vegetable',
  '1,apple,carrot',
  '2,orange,corn',
  '3,banana,potato'
].join('\n');

var obj = csv.toJSON(str, {headers: {included: true}});
console.log(obj);
```

## API

### [csv](index.js#L45)

Parse a string of CSV to a datagrid and render it using the specified [renderer](#renderer). The `.json` renderer is used by default.

**Params**

* `method` **{String}**: The name of the renderer method to use, or a string of CSV. If CSV, the `.json` method will be used.
* `str` **{String|Object}**: String of CSV or options.
* `options` **{Object}**
* `returns` **{String}**

**Example**

```js
var str = `
id,fruit,vegetable
1,apple,carrot
2,orange,corn
3,banana,potato`;

var res = csv(str, {headers: {included: true}});
console.log(res);
// results in:
// [{"id":"1","fruit":"apple","vegetable":"carrot"},
// {"id":"2","fruit":"orange","vegetable":"corn"},
// {"id":"3","fruit":"banana","vegetable":"potato"}]
```

### [.toJSON](index.js#L90)

Parse a string of CSV to a datagrid, format it using one of the `.json*` [renderer](#renderer) methods, then parse it back to JSON.

**Params**

* `method` **{String}**: The name of the renderer method to use, or a string of CSV. If CSV, the `.json` method will be used.
* `str` **{String|Object}**: String of CSV or options.
* `options` **{Object}**
* `returns` **{String}**

**Example**

```js
var str = `
id,fruit,vegetable
1,apple,carrot
2,orange,corn
3,banana,potato`;

var res = csv.toJSON('jsonDict', str, {headers: {included: true}});
console.log(res);
// results in:
// { '1': { fruit: 'apple', vegetable: 'carrot' },
//   '2': { fruit: 'orange', vegetable: 'corn' },
//   '3': { fruit: 'banana', vegetable: 'potato' } }
```

### [Parser](lib/parser.js#L30)

Create a new `Parser` with the given `options`.

**Params**

* `options` **{Options}**

**Example**

```js
var csv = require('parse-csv');
var parser = new csv.Parser();
```

### [.parse](lib/parser.js#L72)

Parse CSV or tab-delimited string into a data-grid formatted JavaScript object.

**Params**

* `str` **{String}**
* `options` **{Object}**
* `returns` **{Object}**

**Example**

```js
var parser = new Parser();

var str = `
id,fruit,vegetable
1,apple,carrot
2,orange,corn
3,banana,potato`;

var datagrid = parser.parse(str);

// results in:
// { data:
//    [ [ '1', 'apple', 'carrot' ],
//      [ '2', 'orange', 'corn' ],
//      [ '3', 'banana', 'potato' ] ],
//   header:
//    { names: [ 'id', 'fruit', 'vegetable' ],
//      types: [ '-1': 'string' ] } }
```

### [Renderer](lib/renderer.js#L22)

Create a new `Renderer` with the given `options`.

**Params**

* `options` **{Object}**

**Example**

```js
var csv = require('parse-csv');
var renderer = new csv.Renderer();
```

### Available renderers

The following render methods are available when the renderer is used directly. Or specify the renderer on `options.renderer` when using the main export function.

* `.as`: Actionscript
* `.asp`: ASP/VBScript
* `.html`: HTML
* `.json`: JSON - Properties
* `.jsonArrayCols`: JSON - Column Arrays
* `.jsonArrayRows`: JSON - Row Arrays
* `.jsonDict`: JSON - Dictionary
* `.mysql`: MySQL
* `.php`: PHP
* `.python`: Python - Dict
* `.ruby`: Ruby
* `.xmlProperties`: XML - Properties
* `.xml`: XML - Nodes
* `.xmlIllustrator`: XML - Illustrator

**Example**

To render CSV as HTML:

```js
var csv = require('parse-csv');
var renderer = new csv.Renderer();

var str = `
id,fruit,vegetable
1,apple,carrot
2,orange,corn
3,banana,potato`;

var html = renderer.html(str, {headers: {included: true}});
console.log(html);
```

Results in:

```html
<table>
  <thead>
    <tr>
      <th class="id-cell">id</th>
      <th class="fruit-cell">fruit</th>
      <th class="vegetable-cell">vegetable</th>
    </tr>
  </thead>
  <tbody>
    <tr class="firstRow">
      <td class="id-cell">1</td>
      <td class="fruit-cell">apple</td>
      <td class="vegetable-cell">carrot</td>
    </tr>
    <tr>
      <td class="id-cell">2</td>
      <td class="fruit-cell">orange</td>
      <td class="vegetable-cell">corn</td>
    </tr>
    <tr class="lastRow">
      <td class="id-cell">3</td>
      <td class="fruit-cell">banana</td>
      <td class="vegetable-cell">potato</td>
    </tr>
  </tbody>
</table>
```

## Options

### Parser options

Available parser options and the actual defaults used.

```js
{
  headers: {
    included: false,
    downcase: true,
    upcase: true
  },
  delimiter: 'tab',
  decimalSign: 'comma'
}
```

### Renderer options

Available renderer options and the actual defaults used.

```js
{
  headers: {
    included: true,
    downcase: true,
    upcase: true
  },

  delimiter: 'tab',
  decimalSign: 'comma',
  outputDataType: 'json',
  columnDelimiter: "\t",
  rowDelimiter: '\n',

  inputHeader: {},
  outputHeader: {},
  dataSelect: {},

  outputText: '',

  newline: '\n',
  indent: '  ',

  commentLine: '//',
  commentLineEnd: '',
  tableName: 'converter',

  useUnderscores: true,
  includeWhiteSpace: true,
  useTabsForIndent: false
}
```

## Related projects

You might also be interested in these projects:

* [gulp-convert](https://www.npmjs.com/package/gulp-convert): Gulp plugin to convert to or from JSON, YAML, XML, PLIST or CSV. | [homepage](https://github.com/assemble/gulp-convert)
* [parser-csv](https://www.npmjs.com/package/parser-csv): CSV parser, compatible with [parser-cache]. | [homepage](https://github.com/jonschlinkert/parser-csv)

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/jonschlinkert/parse-csv/issues/new).

## Building docs

Generate readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install verb && npm run docs
```

Or, if [verb](https://github.com/verbose/verb) is installed globally:

```sh
$ verb
```

## Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

## Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/jonschlinkert/parse-csv/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on May 09, 2016._