'use strict';

var csv = require('./');
// var renderer = new csv.Renderer();
// var parser = new csv.Parser();

var str = `
id,fruit,vegetable
1,apple,carrot
2,orange,corn
3,banana,potato`;

var res = csv('html', str, {headers: {included: true}});
console.log(res)

/**
 * Parse
 */

// console.log(csv.jsonDict(str, {headers: {included: true}}));
// console.log(csv.to('jsonDict', str, {headers: {included: true}}));

/**
 * Render
 */

// var obj = parser.parse(str, {headers: {included: true}});
// var str = renderer.render('json', obj, {headers: {included: true}});
