'use strict';

var some = require( './some.core' );

var drawable = function ( world ) {
  this.world = world;

  this.position = some.vec2.create();

  this.sizeOriginal = some.vec2.create();
  this.sizeValue = this.sizeOriginal;
  this.sizeChange = false;

  this.axisOriginal = some.vec2.create( 0, 1 );
  this.axisValue = some.vec2.create( 0, 1 );

  this.anchorValue = some.vec2.create( 0, 0 );

  this.tempPos = some.vec2.create();
  this.tempAxis = some.vec2.create();
};

drawable.prototype.setPosition = function ( x, y ) {
  some.vec2.set( x, y, this.position );
  return this;
};

drawable.prototype.setSize = function ( x, y ) {
  if( ! this.sizeChange ) {
    this.sizeValue = some.vec2.clone(this.sizeOriginal);
    this.sizeChange = true;
  }
  some.vec2.set( x, y, this.sizeValue );
  return this;
};

drawable.prototype.size = function ( x, y ) {
  if( ! this.sizeChange ) {
    this.sizeValue = some.vec2.clone(this.sizeOriginal);
    this.sizeChange = true;
  }
  some.vec2.add( this.sizeValue, [ x, y ], this.sizeValue );
  return this;
};

drawable.prototype.scale = function ( scale ) {
  some.vec2.mult( this.sizeValue, scale, this.sizeValue );
  return this;
};

drawable.prototype.setAnchor = function ( x, y ) {
  some.vec2.set( x, y, this.anchorValue );
  return this;
};

drawable.prototype.anchor = function( x, y ) {
  some.vec2.add( this.anchorValue, [ x , y ], this.anchorValue );
  return this;
};

drawable.prototype.setAxis = function ( x, y ) {
  some.vec2.set( x, y, this.axisValue );
  return this;
};

drawable.prototype.axis = function ( x, y ) {
  some.vec2.add( this.axisValue, [ x , y ], this.axisValue );
  return this;
}; 

drawable.prototype.setRotation = function ( angle ) {
  angle = angle * some.toRadians;
  some.vec2.copy( this.axisOriginal, this.axisValue );
  some.vec2.rotate( this.axisValue, -angle, this.axisValue );
  return this;
};

drawable.prototype.rotate = function ( angle ) {
  angle = angle * some.toRadians;
  some.vec2.rotate( this.axisValue, -angle, this.axisValue );
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

  var magnitude = some.vec2.len( this.sizeValue ) / some.vec2.len( this.sizeOriginal );

  // Center anchor
  // this.tempPos.add( this.anchorValue ); 

  this.world.push();
    this.world.translate( this.tempPos[ 0 ], this.tempPos[ 1 ] );
    this.world.rotate( some.vec2.heading( this.axisOriginal ) - some.vec2.heading( this.tempAxis ) - some.vec2.heading( this.axisValue ) );
    this.world.scale( this.sizeValue[ 0 ] / this.sizeOriginal[ 0 ], this.sizeValue[ 1 ] / this.sizeOriginal[ 1 ] ); 
    this.world.translate( -this.anchorValue[ 0 ], -this.anchorValue[ 1 ] );
    this.world.strokeWeight( 1 / magnitude );

    this.representation();
  
    if ( DEBUG ) {
      this.world.translate( this.anchorValue[ 0 ], this.anchorValue[ 1 ] );
      this.world.rotate( -some.vec2.heading( this.tempAxis ) );
      
      //pink size
      this.world.stroke( 255, 100, 250 );
      this.world.strokeWeight( 2 );
      this.world.line( 0,0 , this.sizeValue[ 0 ],this.sizeValue[ 1 ] );
      
      this.world.noStroke();
      
      //red origin
      this.world.fill( 0, 100, 80 );
      this.world.rect( -4,-4, 8,8 );

      // green size
      this.world.fill( 150, 150, 100 );
      this.world.rect( this.sizeValue[ 0 ] - 4, this.sizeValue[ 1 ] - 4, 8,8 );

      //blue anchor
      this.world.fill( 200, 150, 100 ); 
      this.world.rect( this.anchorValue[ 0 ] - 4, this.anchorValue[ 1 ] - 4, 8,8 );
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