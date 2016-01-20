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
  
  if ( typeof options.colorsPool !== "undefined" ||
       typeof options.colorspool !== "undefined" ||
       typeof options.colors !== "undefined"
    ) {
    this.colorsPool = options.colorsPool || options.colorspool || options.colors;
  }

  if ( typeof options.drawablesPool !== "undefined" ||
       typeof options.drawablespool !== "undefined" ||
       typeof options.drawables !== "undefined"
    ) {
    this.drawablesPool = options.drawablesPool || options.drawablespool || options.drawables;
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
  while ( this.layout.next() ) {
    n = this.layout.get();
    p = this.drawablesPool.get();
    
    p.drawable.setPosition( n.from[ 0 ], n.from[ 1 ] );
    p.drawable.setAxis( n.to[ 0 ], n.to[ 1 ] );

    this.world.fill( this.colorsPool.get() );
    this.world.stroke( this.colorsPool.get() );

    if ( ! p.fn( this.world, p.drawable ) ) {
      p.drawable.draw();
    }
  }
};

some.group = group;

module.exports = some;