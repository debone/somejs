'use strict';

var some = require( './some.core' );

var drawable = function ( world ) {
  this.world = world;

  this.position = some.vec2.create();
  this.size = some.vec2.create( 1, 0 );
  this.axis = some.vec2.create( 1, 0 );
  this.scale = 1;
  // TODO this.direction
  this.anchor = some.vec2.create( 1, 0 );
  this.originalAxis = some.vec2.create( 1, 0 );
  
  this.from = some.vec2.create(); 
  this.to = some.vec2.create();
};

drawable.prototype.setPosition = function ( x, y ) {
  some.vec2.set( x, y, this.position );
  return this;
};

drawable.prototype.setSize = function ( x, y ) {
  some.vec2.set( x, y, this.size );
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
  some.vec2.rotate( this.axis, some.vec2.heading( this.originalAxis ) - some.vec2.heading( this.axis ) + angle, this.axis );
  return this;
};

drawable.prototype.setScale = function ( scale ) {
  this.scale = scale || 1;
  return this;
};

drawable.prototype.draw = function ( from, size, sizeX, sizeY ) {
  if ( typeof sizeX !== "undefined" && typeof sizeY !== "undefined" ) {
    // fromX, fromY
    some.vec2.set( from, size, this.from );
    some.vec2.set( sizeX, sizeY, this.to );
  }
  else {
    some.vec2.copy( from || this.position, this.from );
    some.vec2.copy( size || this.size, this.to );
  }

  var magnitude = some.vec2.len( this.to ) / some.vec2.len( this.axis );

  // Center anchor
  // this.from.add( this.anchor ); 

  this.world.push();
    this.world.translate( this.from[ 0 ], this.from[ 1 ] );
    this.world.rotate( some.vec2.heading( this.to ) - some.vec2.heading( this.axis ) );
    this.world.translate( this.anchor[ 0 ], this.anchor[ 1 ] );
    this.world.scale( this.scale ); 
    this.world.strokeWeight( 1 / this.scale );

    this.representation();
  
    if ( DEBUG ) {
      this.world.rotate( some.vec2.heading( this.to ) + some.vec2.heading( this.axis ) );
      this.world.stroke( 255, 100, 250 );
      this.world.strokeWeight( 2 );
      this.world.line( 0,0 , this.to[ 0 ],this.to[ 1 ] );
      this.world.noStroke();
      this.world.fill( 0, 100, 80 );
      this.world.rect( -4,-4, 8,8 );
      this.world.fill( 150, 150, 100 ); 
      this.world.rect( this.to[ 0 ] - 4, this.to[ 1 ] - 4, 8,8 );
      this.world.fill( 200, 150, 100 ); 
      this.world.rect( this.anchor[ 0 ] - 4, this.anchor[ 1 ] - 4, 8,8 );
      this.world.rotate( some.vec2.heading( this.to ) );
      this.world.stroke( 0, 0, 0 );
      this.world.line( 0,0, this.axis[ 0 ], this.axis[ 1 ] );
    }
  this.world.pop();

  return this;
};

drawable.prototype.representation = function () {

};

some.drawable = drawable;
module.exports = some;