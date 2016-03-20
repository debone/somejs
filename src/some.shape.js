'use strict';

var some = require( './some.core' );

var shape = function ( world, shapeBeziers, shapeSize ) {
  some.drawable.call( this, world );

  this.shape = [ ];
  this.c1 = [ ];
  this.c2 = [ ];
  this.shapeSize = shapeBeziers.length;

  if ( shapeSize instanceof some.vec2 ) {
    this.sizeOriginal = shapeSize;
  }
  else {
    some.vec2.set( shapeSize.shift(), shapeSize.shift(), this.sizeOriginal );
  }

  this.shapeSize = Math.floor( this.shapeSize / 6 );

  this.shape.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );

  for ( var i = 0; i < this.shapeSize; i++ ) {
    this.c1.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.c2.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.shape.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );
  }

  return this;
};

shape.prototype = Object.create( some.drawable.prototype );

shape.prototype.representation = function ( ) {
  this.world.beginShape( );
    this.world.vertex( this.shape[ 0 ][ 0 ], this.shape[ 0 ][ 1 ] );
    for ( var i = 0; i < this.shapeSize; i++ ) {
      this.world.bezierVertex(
        this.c1[ i ][ 0 ], this.c1[ i ][ 1 ], 
        this.c2[ i ][ 0 ], this.c2[ i ][ 1 ], 
        this.shape[ i + 1 ][ 0 ], this.shape[ i + 1 ][ 1 ]
      );
    }
  this.world.endShape( );
};

some.shape = shape;

module.exports = some;