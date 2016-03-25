'use strict';

var some = require( './some.core' );

var image = function ( world, imgPath ) {
  some.drawable.call( this, world );

  this.image = this.world.loadImage( imgPath );
  
  return this;
};

image.prototype = Object.create( some.drawable.prototype );

image.prototype.representation = function ( ) {
  this.world.image( this.image, 0,0 );
};

some.image = image;

module.exports = some;