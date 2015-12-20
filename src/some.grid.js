'use strict';

var some = require( './some.core' );

var grid = function ( world, width, count, options ) {
  this.world = world;

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

grid.prototype = Object.create( some.drawable.prototype );

grid.prototype.generate = function ( width, count, bend ) {
  var t, s;

  this.fromVerts = [];
  this.toVerts = [];

  //Make move absolute
  this.originVerts = [];
  this.originHeadings = [];

  for( var i = 0; i < count; i++ ) {
    //boom new vert
    this.fromVerts[ i ] = new some.vec2( 
      this.horizontal * ( i % width ) , 
      this.vertical * Math.floor( i / width)
    );

    this.toVerts[ i ] = new some.vec2( 1, 0 );

    this.originVerts[ i ] = this.fromVerts[ i ].clone();
    this.originHeadings[ i ] = this.toVerts[ i ].heading();

    this.toVerts[ i ].normalize();

    if ( bend === 1 ) {
      this.toVerts[ i ].mult( -1 );
    }
    else if ( bend === 2 ) {
      this.fromVerts[ i + width ].copy( this.fromVerts[ i ] );
      this.toVerts[ i + width ].copy( this.toVerts[ i ] );
    }
  }

  return this;
};

grid.prototype.rotateVerts = function ( angle ) {
  angle = angle * some.toRadians;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    this.toVerts[ i ].rotate( this.originHeadings[ i ] + angle - this.toVerts[ i ].heading() );
  }

  return this;
};

grid.prototype.moveVerts = function ( movement ) {
  var angle;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    angle = this.toVerts[ i ].heading( ) - Math.abs( movement.heading( ) );
    movement.rotate( angle );
    this.fromVerts[ i ] = this.originVerts[ i ].clone().add( movement );
    movement.rotate( - angle );
  }

  return this;
};

grid.prototype.setMargin = function ( horizontal, vertical, bend ) {
  this.horizontal = horizontal || this.horizontal;
  this.vertical = vertical || horizontal || this.vertical;

  this.generate( this.width, this.count, bend || 0 );
};

grid.prototype.next = function ( ) {
  if ( this.index + 1 !== this.fromVerts.length ) {
    this.index++;
  }
  else {
    this.index = 0;
  }
  return true;
};

grid.prototype.get = function ( ) {
  return {
    from: this.fromVerts[ this.index ].clone( ),
    to: this.toVerts[ this.index ].clone( )
  };
};

grid.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

some.grid = grid;

module.exports = some;