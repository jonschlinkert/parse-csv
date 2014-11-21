// var render = require('./lib/render.js');
var csv = require('./lib/');

var data = [
  'id,fruit,vegetable',
  '1,apple,carrot',
  '2,orange,corn',
  '3,banana,potato'
].join('\n');


console.log(csv.jsonDict(data, {headers: {included: true}}));
console.log(csv.to('jsonDict', data, {headers: {included: true}}));