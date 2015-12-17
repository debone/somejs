'use strict';

var some = require( './some.core' );

var drawable = function ( world ) {
  this.world = world;

  this.position = new some.vec2();
  this.size = new some.vec2( 1, 0 );
  this.axis = new some.vec2( 1, 0 );
  this.scale = 1;
  // TODO this.direction
  this.anchor = new some.vec2( 1, 0 );
  this.originalAxis = new some.vec2( 1, 0 );
  
  this.from = new some.vec2(); 
  this.to = new some.vec2();
};

drawable.prototype.setPosition = function ( x, y ) {
  this.position.set( x, y );
  return this;
};

drawable.prototype.setSize = function ( x, y ) {
  this.size.set( x, y );
  return this;
};

drawable.prototype.setAnchor = function ( x, y ) {
  this.anchor.set( x, y );
  return this;
}

drawable.prototype.setAxis = function ( x, y ) {
  this.axis.set( x, y );
  this.originalAxis.set( x, y );
  return this;
};

drawable.prototype.setRotation = function ( angle ) {
  angle = angle * some.toRadians;
  this.axis.rotate( this.originalAxis.heading() - this.axis.heading() + angle );
  return this;
};

drawable.prototype.setScale = function ( scale ) {
  this.scale = scale || 1;
  return this;
};

drawable.prototype.draw = function ( from, size, sizeX, sizeY ) {
  if ( typeof sizeX !== "undefined" && typeof sizeY !== "undefined" ) {
    // fromX, fromY
    this.from.set( from, size );
    this.to.set( sizeX, sizeY );
  }
  else {
    this.from.set( from || this.position );
    this.to.set( size || this.size );
  }

  var magnitude = this.to.len() / this.axis.len();

  // Center anchor
  // this.from.add( this.anchor ); 

  this.world.push();
    this.world.translate( this.from.x, this.from.y );
    this.world.rotate( this.to.heading() - this.axis.heading() );
    this.world.translate( this.anchor.x, this.anchor.y );
    this.world.scale( this.scale ); 
    this.world.strokeWeight( 1 / this.scale );

    this.representation();
  
    if ( DEBUG ) {
      this.world.rotate( this.to.heading() + this.axis.heading() );
      this.world.stroke( 255, 100, 250 );
      this.world.strokeWeight( 2 );
      this.world.line( 0,0 , this.to.x,this.to.y );
      this.world.noStroke();
      this.world.fill( 0, 100, 80 );
      this.world.rect( -4,-4, 8,8 );
      this.world.fill( 150, 150, 100 ); 
      this.world.rect( this.to.x - 4, this.to.y - 4, 8,8 );
      this.world.fill( 200, 150, 100 ); 
      this.world.rect( this.anchor.x - 4, this.anchor.y - 4, 8,8 );
      this.world.rotate( this.to.heading() );
      this.world.stroke( 0, 0, 0 );
      this.world.line( 0,0, this.axis.x, this.axis.y );
    }
  this.world.pop();

  return this;
};

drawable.prototype.representation = function () {

};

some.drawable = drawable;
module.exports = some;