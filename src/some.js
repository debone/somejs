'use strict';

var some = function ( ) {

};

some.Array = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;

var degrees = Math.PI / 180;
var radians = 1 / degrees;

some.toRadians = function ( degree ) {
  return degree * degrees;
}

some.toDegrees = function ( radian ) {
  return radian * radians;
}

module.exports = some;