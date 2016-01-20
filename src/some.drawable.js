'use strict';

var some = require( './some.core' );

var drawable = function ( world ) {
  this.world = world;

  this.position = some.vec2.create();
  this.axis = some.vec2.create( 0, 1 );
  this.anchor = some.vec2.create( 0, 0 );

  this.size = some.vec2.create( 1, 1 );
  this.to = this.size;
  this.isToDefined = false;

  this.originalAxis = some.vec2.create( 0, 1 );
  this.axis = some.vec2.create( 0, 0 );

  this.originalAnchor = some.vec2.create( 0, 0 );

  this.tempPos = some.vec2.create();
  this.tempAxis = some.vec2.create();
};

drawable.prototype.setPosition = function ( x, y ) {
  some.vec2.set( x, y, this.position );
  return this;
};

drawable.prototype.setSize = function ( x, y ) {
  if( !this.isToDefined ) {
    this.isToDefined = true;
    this.to = some.vec2.create();
  }
  some.vec2.set( x, y, this.to );
  return this;
};

drawable.prototype.size = function ( x, y ) {
  some.vec2.set( x, y || x, this.size );
  return this;
};

drawable.prototype.setAnchor = function ( x, y ) {
  some.vec2.set( x, y, this.anchor );
  return this;
};

drawable.prototype.setAxis = function ( x, y ) {
  some.vec2.set( x, y, this.axis );
  some.vec2.set( x, y, this.originalAxis );
  return this;
};

drawable.prototype.setRotation = function ( angle ) {
  angle = angle * some.toRadians;
  some.vec2.copy( this.originalAxis, this.axis );
  some.vec2.rotate( this.axis, angle, this.axis );
  return this;
};

drawable.prototype.draw = function ( from, axis, axisX, axisY ) {
  if ( typeof axisX !== "undefined" && typeof axisY !== "undefined" ) {
    // fromX, fromY
    some.vec2.set( from, axis, this.tempPos );
    some.vec2.set( axisX, axisY, this.tempAxis );
  }
  else {
    some.vec2.copy( from || this.position, this.tempPos );
    some.vec2.copy( axis || [ 0,0 ], this.tempAxis );
  }

  // Angle reference starts in -90, not 0
  // Math.atan2( 0, -0 ) === pi
  some.vec2.set( this.tempAxis[ 0 ], -this.tempAxis[ 1 ] || 0 , this.tempAxis );

  var magnitude = some.vec2.len( this.to ) / some.vec2.len( this.size );

  // Center anchor
  // this.tempPos.add( this.anchor ); 

  this.world.push();
    this.world.translate( this.tempPos[ 0 ], this.tempPos[ 1 ] );
    this.world.rotate( some.vec2.heading( this.tempAxis ) + some.vec2.heading( this.axis ) );
    this.world.scale( this.to[ 0 ] / this.size[ 0 ], this.to[ 1 ] / this.size[ 1 ] ); 
    this.world.translate( -this.anchor[ 0 ], -this.anchor[ 1 ] );
    this.world.strokeWeight( 1 / magnitude );

    this.representation();
  
    if ( DEBUG ) {
      this.world.translate( this.anchor[ 0 ], this.anchor[ 1 ] );
      this.world.rotate( -some.vec2.heading( this.tempAxis ) );
      
      //pink size
      this.world.stroke( 255, 100, 250 );
      this.world.strokeWeight( 2 );
      this.world.line( 0,0 , this.to[ 0 ],this.to[ 1 ] );
      
      this.world.noStroke();
      
      //red origin
      this.world.fill( 0, 100, 80 );
      this.world.rect( -4,-4, 8,8 );

      // green size
      this.world.fill( 150, 150, 100 );
      this.world.rect( this.to[ 0 ] - 4, this.to[ 1 ] - 4, 8,8 );

      //blue anchor
      this.world.fill( 200, 150, 100 ); 
      this.world.rect( this.anchor[ 0 ] - 4, this.anchor[ 1 ] - 4, 8,8 );
      this.world.rotate( - some.vec2.heading( this.tempAxis ) );

      // axis
      this.world.stroke( "#000000" );
      this.world.line( 0,0, this.tempAxis[ 0 ], this.tempAxis[ 1 ] );
    }
  this.world.pop();

  return this;
};

drawable.prototype.representation = function () {

};

some.drawable = drawable;
module.exports = some;