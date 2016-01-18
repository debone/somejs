'use strict';

var some = require( './some.core' );

var clip = function ( world, clip, steps, precision ) {
  some.layout.call( this, world, true );

  this.ran = new some.random();

  // TODO is this going to work? lol
  this.image = this.world.loadImage( clip, (function () {
    this.generate( steps );
  } ).bind( this, steps ) );

  return this;
};

clip.prototype = Object.create( some.layout.prototype );

clip.prototype.generate = function ( steps ) {
  var t, s;

  this.initArrays( steps || this.steps );
  
  // randomly chooses a position
  // test that position ( ran.uniform() < alpha )
  // if true, save position
  // if false, tries again and i--
  // this is wrong, because it is minimum o(n) and max o(n^n)

  for( var i = 0; i < this.steps; i++ ) {
    this.fromVerts[ i ] = some.vec2.create(
      this.ran.random( this.image.width ), 
      this.ran.random( this.image.height )
    );

    this.toVerts[ i ] = some.vec2.create( 1, 0 );

    this.originVerts[ i ] = some.vec2.clone( this.fromVerts[ i ] );
    this.originHeadings[ i ] = some.vec2.heading( this.toVerts[ i ] );
  }

  return this;
};

some.clip = clip;

module.exports = some;