'use strict';

var some = function ( ) { };

some.Array = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;

// Conversion Multiplications
some.toRadians = Math.PI / 180;
some.toDegrees = 1 / some.toRadians;

// CONSTANTS 
// grids
some.GRID = 1;
some.SPINE = 2;

// random & noise
some.ORDER = 3;
some.NOISE = 4;
some.RANDOM = 5;
some.NORMAL = 6;
some.EXPONENTIAL = 7;
some.POISSON = 8;
some.GAMMA = 9;


module.exports = some;