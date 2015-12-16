'use strict';

var some = require( 'some' );

drawablesPool = function ( world, options ) {
  this.world = world;

  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  this.drawFunction = false;

  this.index = -1;

  options = options || { };

  if ( options.select ) {
    // How is the pool being draw?
  }

  if ( options.draw ) { 
    // Unique draw function
    this.drawFunction = options.draw;
  }
};

drawablesPool.prototype.add = function ( drawable, count, drawableFunction ) {
  count = count || 1;
  if ( drawable instanceof some.drawable ) {
    while ( count -- ) {
      this.drawables[ this.drawables.length ] = drawable;
      this.drawablesFunctions[ this.drawablesFunctions.length ] = drawableFunction || function ( ) { };
    }
  }

  return this;
};

drawablesPool.prototype.remove = function ( index ) {
  if ( index > -1 ) {
    this.drawables = this.drawables.splice( index, 1 );
    this.drawablesFunctions = this.drawablesFunctions.splice( index, 1 );
  }

  return this;
};

drawablesPool.prototype.clear = function ( ) {
  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  return this;
};

drawablesPool.prototype.next = function ( ) {
  if ( this.index + 1 !== this.drawables.length ) {
    this.index++;
    return true;
  }
  this.index = -1;
  return false;
};

drawablesPool.prototype.get = function ( ) {
  return { 
    drawable: this.drawables[ this.index ],
    fn: ( this.drawFunction ) ? this.drawFunction : this.drawablesFunctions[ this.index ]
  };
};

drawablesPool.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

some.drawablesPool = drawablesPool;

module.exports = some;