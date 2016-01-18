'use strict';

var some = require( './some.core' );

var brush = function ( world, width, height ) {
  some.drawable.call( this, world );

  this.canvas = some.canvas( width, height );
};

brush.prototype.representation = function ( ) {
  
};

some.brush = brush;

module.exports = some;