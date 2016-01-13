'use strict';

var some = require( './some.core' );

var colorsPool = function ( world, options ) {
  some.iterator.call( this, world, true );

  this.colors = [ ];

  options = options || { };
};

colorsPool.prototype = Object.create( some.iterator.prototype );

colorsPool.prototype.add = function ( color, count ) {
  count = count || 1;
  // TODO some.color
  if ( color instanceof p5.Color ) {
    while ( count -- ) {
      this.length++;
      this.colors[ this.colors.length ] = color;
    }
  }
  else {
    while ( count -- ) {
      this.length++;
      this.colors[ this.colors.length ] = this.world.color( color );
    }
  }

  return this;
};

colorsPool.prototype.remove = function ( index ) {
  this.length--;
  if ( index > -1 ) {
    this.colors = this.colors.splice( index, 1 );
  }

  return this;
};

colorsPool.prototype.clear = function ( ) {
  this.colors = [ ];

  this.length = 0;
  this.reset();

  return this;
};

colorsPool.prototype.retrieve = function ( index ) {
  return this.colors[ index ];
};

/*colorsPool.prototype.fill = function ( ) {
  this.next();
  this.world.fill( this.get() );
};

colorsPool.prototype.stroke = function ( ) {
  this.next();
  this.world.stroke( this.get() );
};

colorsPool.prototype.fillAndStroke = function ( ) {
  this.fill();
  this.stroke();
};*/

some.colorsPool = colorsPool;

module.exports = some;