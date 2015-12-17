'use strict';

var some = require( './some.core' );

var shape = function ( world, shapeBeziers, shapeAxis ) {
  some.drawable.call( this, world );

  this.shape = [ ];
  this.c1 = [ ];
  this.c2 = [ ];
  this.shapeSize = shapeBeziers.length;

  if ( shapeAxis instanceof some.vec2 ) {
    this.axis = shapeAxis;
  }
  else {
    this.axis = new some.vec2( shapeAxis.shift(), shapeAxis.shift() );
  }

  this.size = this.axis.copy();
  this.shapeSize = Math.floor( this.shapeSize / 6 );

  this.shape.push( new some.vec2( shapeBeziers.shift(), shapeBeziers.shift() ) );

  for ( var i = 0; i < this.shapeSize; i++ ) {
    this.c1.push( new some.vec2( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.c2.push( new some.vec2( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.shape.push( new some.vec2( shapeBeziers.shift(), shapeBeziers.shift() ) );
  }

  return this;
};

shape.prototype = Object.create( some.drawable.prototype );

shape.prototype.representation = function ( ) {
  this.world.beginShape( );
    this.world.vertex( this.shape[ 0 ].x, this.shape[ 0 ].y );
    for ( var i = 0; i < this.shapeSize; i++ ) {
      this.world.bezierVertex(
        this.c1[ i ].x, this.c1[ i ].y, 
        this.c2[ i ].x, this.c2[ i ].y, 
        this.shape[ i + 1 ].x, this.shape[ i + 1 ].y
      );
    }
  this.world.endShape( );
};

some.shape = shape;

module.exports = some;