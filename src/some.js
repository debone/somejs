'use strict';

var some = function ( ) {

};

some.Array = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;

// Conversion Multiplications
some.degrees = Math.PI / 180;
some.radians = 1 / some.degrees;

module.exports = some;