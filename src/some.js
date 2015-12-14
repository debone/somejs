'use strict';

var some = function ( ) {

};

some.Array = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;

module.exports = some;