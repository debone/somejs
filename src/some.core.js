'use strict';

var some = function ( ) { };

some.Array = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;

// Conversion Multiplications
some.toRadians = Math.PI / 180;
some.toDegrees = 1 / some.toDegrees;

module.exports = some;