'use strict';

var some = require( './some.core' );

var group = function ( world, options ) {
  some.drawable.call( this, world );

  this.layout = {
    next: function () { }
  };

  this.colorsPool = {
    next: function () { }
  };

  this.drawablesPool = {};

  options = options || { };

  if ( typeof options.layout !== "undefined" ) {
    this.layout = options.layout;
  }
  if ( typeof options.colorsPool !== "undefined" ) {
    this.colorsPool = options.colorsPool;
  }
  if ( typeof options.drawablesPool !== "undefined" ) {
    this.drawablesPool = options.drawablesPool;
  }

  return this; 
};

group.prototype = Object.create( some.drawable.prototype );

group.prototype.setDrawablesPool = function ( drawablesPool ) {
  this.drawablesPool = drawablesPool;
  return this;
};

group.prototype.setColorsPool = function ( colorsPool ) {
  this.colorsPool = colorsPool;
  return this;
};

group.prototype.setLayout = function ( layout ) {
  this.layout = layout;
  return this;
};

group.prototype.representation = function ( ) {
  var n, c, p;
  this.layout.reset();
  //this.colorsPool.reset();
  while ( this.drawablesPool.next() ) {
    n = this.drawablesPool.get();

    if ( this.layout.next() ) { 
      p = this.layout.get();
      n.drawable.setPosition( p.from[ 0 ], p.from[ 1 ] );
      n.drawable.setSize( p.to[ 0 ], p.to[ 1 ] );
    }

    if ( this.colorsPool.next() ) {
      c = this.colorsPool.get();
      if ( c ) {
        this.world.fill( c );
      }
      else {
        this.world.noFill();
      }
    }

    if ( this.colorsPool.next() ) {
      c = this.colorsPool.get();
      if ( c ) {
        this.world.stroke( c );
      }
      else {
        this.world.noStroke();
      }
    }

    if ( ! n.fn( this.world, n.drawable ) ) {
      n.drawable.draw();
    }
  }
};

some.group = group;

module.exports = some;