'use strict';

var render = require('./render');

Object.keys(render).forEach(function (type) {
  module.exports[type] = function (data, options) {
    return render(type, data, options);
  };
});

module.exports.to = render;
