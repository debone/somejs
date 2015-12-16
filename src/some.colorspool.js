'use strict';

var some = require( 'some' );

var colorsPool = function ( world, options ) {
  this.world = world;

  this.colors = [ ];

  this.index = -1;

  options = options || { };

  if ( typeof options.select !== "undefined" ) {
    // How is the pool being draw?
  }
};

colorsPool.prototype.add = function ( color, count ) {
  count = count || 1;
  if ( color instanceof some.color ) {
    while ( count -- ) {
      this.colors[ this.colors.length ] = color;
    }
  }

  return this;
};

colorsPool.prototype.remove = function ( index ) {
  if ( index > -1 ) {
    this.colors = this.colors.splice( index, 1 );
  }

  return this;
};

colorsPool.prototype.clear = function ( ) {
  this.colors = [ ];

  return this;
};

colorsPool.prototype.next = function ( ) {
  if ( this.index + 1 !== this.colors.length ) {
    this.index++;
  }
  else {
    this.index = 0;
  }
  return true;
};

colorsPool.prototype.get = function ( ) {
  return { 
    stroke: this.colors[ this.index + 1 ],
    fill: this.colors[ this.index ]
  };
};

colorsPool.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

some.colorsPool = colorsPool;

module.exports = some;