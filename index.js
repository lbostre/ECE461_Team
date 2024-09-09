"use strict";
exports.__esModule = true;
exports.hello = void 0;
var world = 'world!';
function hello(who) {
    if (who === void 0) { who = world; }
    return "Hello " + who + "! ";
}
exports.hello = hello;
console.log(hello(world));
