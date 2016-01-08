'use strict';

var some = require( './some.core' );

var canvas = function ( world, width, height ) {
  some.drawable.call( this, world );

  this.canvas = this.world.createGraphics( width || 150, height || 150 );

  return this;
};

canvas.prototype = Object.create( some.drawable.prototype );

canvas.prototype.representation = function ( ) {
  this.world.image( this.canvas, 0, 0 );
};

some.canvas = canvas;

module.exports = some;