'use strict';

/**
 * Module dependencies
 */

var isObject = require('isobject');
var extend = require('extend-shallow');
var merge = require('mixin-deep');

/**
 * Create a new `Renderer` with the given `options`.
 *
 * ```js
 * var csv = require('parse-csv');
 * var renderer = new csv.Renderer();
 * ```
 * @param {Object} `options`
 * @api public
 */

function Renderer(options) {
  var defaults = {
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
  };

  this.options = merge({}, defaults, options);
  if (this.options.includeWhiteSpace) {
    this.options.newline = '\n';
  } else {
    this.options.indent = '';
    this.options.newline = '';
  }
};

Renderer.prototype.render = function(method/*, datagrid, options*/) {
  var args = [].slice.call(arguments, 1);
  return this[method].apply(this, args);
};

/**
 * JSON
 */

Renderer.prototype.json = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var newline = opts.newline;
  var numRows = data.length;
  var numColumns = header.names.length;
  var rowOutput;
  var res = "[";

  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    res += "{";
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == "int") || (header.types[j] == "float")) {
        rowOutput = row[j] || "null";
      } else {
        rowOutput = '"' + (row[j] || "") + '"';
      }

      res += ('"' + header.names[j] + '"' + ":" + rowOutput);

      if (j < (numColumns - 1)) {
        res += ",";
      }
    }
    res += "}";
    if (i < (numRows - 1)) {
      res += "," + newline;
    }
  }
  res += "]";
  return res;
};

/**
 * JSON column arrays.
 */

Renderer.prototype.jsonArrayCols = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = "";
  var numRows = data.length;
  var numColumns = header.names.length;

  res += "{" + newline;
  for (var i = 0; i < numColumns; i++) {
    res += indent + '"' + header.names[i] + '":[';
    for (var j = 0; j < numRows; j++) {
      if ((header.types[i] == "int") || (header.types[i] == "float")) {
        res += data[j][i] || 0;
      } else {
        res += '"' + (data[j][i] || "") + '"';
      }
      if (j < (numRows - 1)) {
        res += ",";
      }
    }
    res += "]";
    if (i < (numColumns - 1)) {
      res += "," + newline;
    }
  }
  res += newline + "}";
  return res;
};

/**
 * JSON row arrays.
 */

Renderer.prototype.jsonArrayRows = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = "";
  var numRows = data.length;
  var numColumns = header.names.length;

  res += "[" + newline;
  for (var i = 0; i < numRows; i++) {
    res += indent + "[";
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == "int") || (header.types[j] == "float")) {
        res += data[i][j] || 0;
      } else {
        res += '"' + (data[i][j] || "") + '"';
      }
      if (j < (numColumns - 1)) {
        res += ",";
      }
    }
    res += "]";
    if (i < (numRows - 1)) {
      res += "," + newline;
    }
  }
  res += newline + "]";
  return res;
};

/**
 * JSON dictonary.
 */

Renderer.prototype.jsonDict = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = '';
  var numRows = data.length;
  var numColumns = header.names.length;

  res += '{' + newline;
  for (var i = 0; i < numRows; i++) {
    res += indent + '"' + data[i][0] + '": ';
    if (numColumns == 2) {
      res += _fmtVal(i, 1, data);
    } else {
      res += '{ ';
      for (var j = 1; j < numColumns; j++) {
        if (j > 1) res += ', ';
        res += '"' + header.names[j] + '"' + ":" + _fmtVal(i, j, data);
      }
      res += '}';
    }
    if (i < (numRows - 1)) {
      res += ',' + newline;
    }
  }
  res += newline + '}';

  function _fmtVal(i, j) {
    if ((header.types[j] == 'int') || (header.types[j] == "float")) {
      return data[i][j] || 0;
    } else {
      return '"' + (data[i][j] || '') + '"';
    }
  }

  return res;
};

/**
 * Actionscript
 */

Renderer.prototype.as = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var newline = opts.newline;
  var res = '[';
  var numRows = data.length;
  var numColumns = header.names.length;
  var rowOutput;

  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    res += '{';
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == 'int') || (header.types[j] == 'float')) {
        rowOutput = row[j] || 'null';
      } else {
        rowOutput = '"' + (row[j] || '') + '"';
      }
      res += (header.names[j] + ':' + rowOutput);
      if (j < (numColumns - 1)) {
        res += ',';
      }
    }
    res += '}';
    if (i < (numRows - 1)) {
      res += ',' + newline;
    }
  }
  res += '];';
  return res;
};

/**
 * Render a parsed CSV datagrid as ASP / VBScript
 */

Renderer.prototype.asp = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var newline = opts.newline;
  var res = "";
  var numRows = data.length;
  var numColumns = header.names.length;
  var rowOutput;

  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == "int") || (header.types[j] == "float")) {
        rowOutput = row[j] || "null";
      } else {
        rowOutput = '"' + (row[j] || "") + '"';
      }
      res += 'myArray(' + j + ',' + i + ') = ' + rowOutput + newline;
    }
    res = 'Dim myArray(' + (j - 1) + ',' + (i - 1) + ')' + newline + res;
  }

  return res;
};

/**
 * Render a parsed CSV datagrid as an HTML table
 */

Renderer.prototype.html = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = '';
  var numRows = data.length;
  var numColumns = header.names.length;

  res += '<table>' + newline;
  res += indent + '<thead>' + newline;
  res += indent + indent + '<tr>' + newline;

  for (var i = 0; i < numColumns; i++) {
    res += indent + indent + indent + '<th class="' + header.names[i] + '-cell">';
    res += header.names[i];
    res += '</th>' + newline;
  }
  res += indent + indent + '</tr>' + newline;
  res += indent + '</thead>' + newline;
  res += indent + '<tbody>' + newline;
  for (var ii = 0; ii < numRows; ii++) {
    var row = data[ii];
    var rowClassName = '';
    if (ii === numRows - 1) {
      rowClassName = ' class="lastRow"';
    } else if (ii === 0) {
      rowClassName = ' class="firstRow"';
    }
    res += indent + indent + '<tr' + rowClassName + '>' + newline;
    for (var iii = 0; iii < numColumns; iii++) {
      res += indent + indent + indent + '<td class="' + header.names[iii] + '-cell">';
      res += row[iii];
      res += '</td>' + newline;
    }
    res += indent + indent + '</tr>' + newline;
  }
  res += indent + '</tbody>' + newline;
  res += '</table>';
  return res;
};

/**
 * Render a parsed CSV datagrid as MYSQL
 */

Renderer.prototype.mysql = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = '';
  var numRows = data.length;
  var numColumns = header.names.length;
  var tableName = 'converter';

  res += 'CREATE TABLE ' + tableName + ' (' + newline;
  res += indent + 'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,' + newline;
  for (var i = 0; i < numColumns; i++) {
    var dataType = 'VARCHAR(255)';
    if ((header.types[i] == 'int') || (header.types[i] == 'float')) {
      dataType = header.types[i].toUpperCase();
    }
    res += indent + '' + header.names[i] + ' ' + dataType;
    if (i < numColumns - 1) {
      res += ',';
    }
    res += newline;
  }
  res += ');' + newline;
  res += 'INSERT INTO ' + tableName + " " + newline + indent + '(';
  for (var ii = 0; ii < numColumns; ii++) {
    res += header.names[ii];
    if (ii < numColumns - 1) {
      res += ',';
    }
  }
  res += ') ' + newline + 'VALUES ' + newline;
  for (var iii = 0; iii < numRows; iii++) {
    res += indent + '(';
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == 'int') || (header.types[j] == 'float')) {
        res += data[iii][j] || 'null';
      } else {
        res += '\'' + (data[iii][j] || '') + '\'';
      }

      if (j < numColumns - 1) {
        res += ',';
      }
    }
    res += ')';
    if (iii < numRows - 1) {
      res += "," + newline;
    }
  }
  res += ";";
  return res;
};

/**
 * Render a parsed CSV datagrid as PHP
 */

Renderer.prototype.php = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = "";
  var numRows = data.length;
  var numColumns = header.names.length;
  var rowOutput;

  res += "array(" + newline;
  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    res += indent + "array(";
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == "int") || (header.types[j] == "float")) {
        rowOutput = row[j] || "null";
      } else {
        rowOutput = '"' + (row[j] || "") + '"';
      }
      res += ('"' + header.names[j] + '"' + "=>" + rowOutput);
      if (j < (numColumns - 1)) {
        res += ",";
      }
    }
    res += ")";
    if (i < (numRows - 1)) {
      res += "," + newline;
    }
  }
  res += newline + ");";
  return res;
};

/**
 * Python dict.
 */

Renderer.prototype.python = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var newline = opts.newline;
  var res = "[";
  var numRows = data.length;
  var numColumns = header.names.length;
  var rowOutput;

  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    res += "{";
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == "int") || (header.types[j] == "float")) {
        rowOutput = row[j] || "None";
      } else {
        rowOutput = '"' + (row[j] || "") + '"';
      }

      res += ('"' + header.names[j] + '"' + ":" + rowOutput);

      if (j < (numColumns - 1)) {
        res += ",";
      }
    }
    res += "}";
    if (i < (numRows - 1)) {
      res += "," + newline;
    }
  }
  res += "];";
  return res;
};

/**
 * Ruby
 */

Renderer.prototype.ruby = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var newline = opts.newline;
  var res = '';
  var numRows = data.length;
  var numColumns = header.names.length;
  var rowOutput;

  res += '[';

  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    res += '{';
    for (var j = 0; j < numColumns; j++) {
      if ((header.types[j] == 'int') || (header.types[j] == 'float')) {
        rowOutput = row[j] || 'nil';
      } else {
        rowOutput = '"' + (row[j] || '') + '"';
      }
      res += ('"' + header.names[j] + '"' + '=>' + rowOutput);
      if (j < (numColumns - 1)) {
        res += ',';
      }
    }
    res += '}';
    if (i < (numRows - 1)) {
      res += ',' + newline;
    }
  }
  res += '];';
  return res;
};

/**
 * XML nodes
 */

Renderer.prototype.xml = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = '';
  var numRows = data.length;
  var numColumns = header.names.length;

  res = '<?xml version="1.0" encoding="UTF-8"?>' + newline;
  res += '<rows>' + newline;

  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    res += indent + '<row>' + newline;
    for (var j = 0; j < numColumns; j++) {
      res += indent + indent + '<' + header.names[j] + '>';
      res += row[j] || '';
      res += '</' + header.names[j] + '>' + newline;
    }
    res += indent + '</row>' + newline;
  }
  res += '</rows>';
  return res;
};

/**
 * XML properties
 */

Renderer.prototype.xmlProperties = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = '';
  var numRows = data.length;
  var numColumns = header.names.length;

  res = '<?xml version="1.0" encoding="UTF-8"?>' + newline;
  res += '<rows>' + newline;
  for (var i = 0; i < numRows; i++) {
    var row = data[i];
    res += indent + '<row ';
    for (var j = 0; j < numColumns; j++) {
      res += header.names[j] + '=';
      res += '"' + row[j] + '" ';
    }
    res += '></row>' + newline;
  }
  res += '</rows>';
  return res;
};

/**
 * XML Illustrator
 */

Renderer.prototype.xmlIllustrator = function(datagrid, options) {
  var opts = extend({}, this.options, options);
  datagrid = extend({}, datagrid);

  var data = datagrid.data;
  var header = datagrid.header || opts.header;
  var indent = opts.indent;
  var newline = opts.newline;
  var res = "";
  var numRows = data.length;
  var numColumns = header.names.length;

  res = '<?xml version="1.0" encoding="utf-8"?>' + newline;
  res += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20001102//EN"    "http://www.w3.org/TR/2000/CR-SVG-20001102/DTD/svg-20001102.dtd" [' + newline;
  res += indent + '<!ENTITY ns_graphs "http://ns.adobe.com/Graphs/1.0/">' + newline;
  res += indent + '<!ENTITY ns_vars "http://ns.adobe.com/Variables/1.0/">' + newline;
  res += indent + '<!ENTITY ns_imrep "http://ns.adobe.com/ImageReplacement/1.0/">' + newline;
  res += indent + '<!ENTITY ns_custom "http://ns.adobe.com/GenericCustomNamespace/1.0/">' + newline;
  res += indent + '<!ENTITY ns_flows "http://ns.adobe.com/Flows/1.0/">' + newline;
  res += indent + '<!ENTITY ns_extend "http://ns.adobe.com/Extensibility/1.0/">' + newline;
  res += ']>' + newline;
  res += '<svg>' + newline;
  res += '<variableSets  xmlns="&ns_vars;">' + newline;
  res += indent + '<variableSet  varSetName="binding1" locked="none">' + newline;
  res += indent + indent + '<variables>' + newline;
  for (var i = 0; i < numColumns; i++) {
    res += indent + indent + indent + '<variable varName="' + header.names[i] + '" trait="textcontent" category="&ns_flows;"></variable>' + newline;
  }
  res += indent + indent + '</variables>' + newline;
  res += indent + indent + '<v:sampleDataSets  xmlns:v="http://ns.adobe.com/Variables/1.0/" xmlns="http://ns.adobe.com/GenericCustomNamespace/1.0/">' + newline;

  for (var ii = 0; ii < numRows; ii++) {
    var row = data[ii];
    res += indent + indent + indent + '<v:sampleDataSet dataSetName="' + row[0] + '">' + newline;
    for (var j = 0; j < numColumns; j++) {
      res += indent + indent + indent + indent + '<' + header.names[j] + '>' + newline;
      res += indent + indent + indent + indent + indent + '<p>' + row[j] + '</p>' + newline;
      res += indent + indent + indent + indent + '</' + header.names[j] + '>' + newline;
    }
    res += indent + indent + indent + '</v:sampleDataSet>' + newline;
  }

  res += indent + indent + '</v:sampleDataSets>' + newline;
  res += indent + '</variableSet>' + newline;
  res += '</variableSets>' + newline;
  res += '</svg>' + newline;
  return res;
};

/**
 * Expose `Renderer`
 */

module.exports = Renderer;
