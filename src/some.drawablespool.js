'use strict';

var some = require( './some.core' );

var drawablesPool = function ( world, options ) {
  some.iterator.call( this, world, true );

  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  this.drawFunction = false;

  options = options || { };

  if ( options.draw ) { 
    // Unique draw function
    this.drawFunction = options.draw;
  }
};

drawablesPool.prototype = Object.create( some.iterator.prototype );

drawablesPool.prototype.add = function ( drawable, count, drawableFunction ) {
  count = count || 1;

  // TODO Move this to iterator ( drawablesPool.prototype.insert & iterator.prototype.add )
  this.length += count;
  
  if ( drawable instanceof some.drawable ) {
    while ( count -- ) {
      this.drawables[ this.drawables.length ] = drawable;
      this.drawablesFunctions[ this.drawablesFunctions.length ] = drawableFunction || function ( ) { };
    }
  }

  return this;
};

drawablesPool.prototype.remove = function ( index ) {
  // TODO Same as add
  this.length--;

  if ( index > -1 ) {
    this.drawables = this.drawables.splice( index, 1 );
    this.drawablesFunctions = this.drawablesFunctions.splice( index, 1 );
  }

  return this;
};

drawablesPool.prototype.clear = function ( ) {
  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  this.length = 0;
  this.reset();

  return this;
};

drawablesPool.prototype.retrieve = function ( index ) { 
  return {
    drawable: this.drawables[ index ],
    fn: ( this.drawFunction ) ? this.drawFunction : this.drawablesFunctions[ index ]
  };
};

some.drawablesPool = drawablesPool;

module.exports = some;