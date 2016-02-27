'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVendorPrefix = getVendorPrefix;

var _string = require('./string');

/**
 * Get the vendor prefix for a property
 *
 * @param {array}
 * @returns {string}
 */
function getVendorPrefix(property, el) {
  el = el || document.createElement('div');
  var prefixes = ['', 'ms', 'Moz', 'webkit'];
  var result = undefined;
  prefixes.forEach(function (prefix) {
    if (result) return;
    var prop = prefix ? prefix + (0, _string.capitalize)(property) : property;
    if (typeof el.style[prop] !== 'undefined') {
      result = prop;
    }
  });
  return result;
}