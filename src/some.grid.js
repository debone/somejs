'use strict';

var some = require( './some.core' );

var grid = function ( world, width, count, options ) {
  some.iterator.call( this, world );

  this.fromVerts = [ ];
  this.toVerts = [ ];

  this.index = -1;

  this.originVerts = [ ];
  this.originHeadings = [ ];

  this.width = width;
  this.count = count;

  options = options || { };

  this.horizontal = options.horizontal || 1;
  this.vertical = options.vertical || 1;

  this.generate( width, count, options.bend || 0 );

  return this;
};

grid.prototype = Object.create( some.iterator.prototype );

grid.prototype.generate = function ( width, count, bend ) {
  var t, s;

  this.fromVerts = [];
  this.toVerts = [];

  //Make move absolute
  this.originVerts = [];
  this.originHeadings = [];

  this.length = count;

  for( var i = 0; i < count; i++ ) {
    //boom new vert
    this.fromVerts[ i ] = some.vec2.create( 
      this.horizontal * ( i % width ) , 
      this.vertical * Math.floor( i / width)
    );

    this.toVerts[ i ] = some.vec2.create( 1, 0 );

    this.originVerts[ i ] = some.vec2.clone( this.fromVerts[ i ] );
    this.originHeadings[ i ] = some.vec2.heading( this.toVerts[ i ] );

    some.vec2.normalize( this.toVerts[ i ], this.toVerts[ i ] );

    if ( bend === 1 ) {
      some.vec2.mult( this.toVerts[ i ], -1, this.toVerts[ i ] );
    }
    else if ( bend === 2 ) {
      some.vec2.copy( this.fromVerts[ i ], this.fromVerts[ i + width ] );
      some.vec2.copy( this.toVerts[ i ], this.toVerts[ i + width ] );
    }
  }

  return this;
};

grid.prototype.rotateVerts = function ( angle ) {
  angle = angle * some.toRadians;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    some.vec2.rotate( this.toVerts[ i ], this.originHeadings[ i ] + angle - some.vec2.heading( this.toVerts[ i ] ), this.toVerts[ i ] );
  }

  return this;
};

grid.prototype.moveVerts = function ( movement ) {
  var angle;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    angle = some.vec2.heading( this.toVerts[ i ] ) - Math.abs( some.vec2.heading( movement ) );
    some.vec2.rotate( movement, angle, movement );
    some.vec2.copy( this.originVerts[ i ], this.fromVerts[ i ] );
    some.vec2.add( this.fromVerts[ i ], movement, this.fromVerts[ i ] );
    some.vec2.rotate( movement, - angle, movement );
  }

  return this;
};

grid.prototype.setMargin = function ( horizontal, vertical, bend ) {
  this.horizontal = horizontal || this.horizontal;
  this.vertical = vertical || horizontal || this.vertical;

  this.generate( this.width, this.count, bend || 0 );

  return this;
};

grid.prototype.retrieve = function ( index ) {
  return {
    from: this.fromVerts[ index ],
    to: this.toVerts[ index ]
  };
};

some.grid = grid;

module.exports = some;