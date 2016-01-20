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
  this.initArrays( steps || this.steps );
  
  var x, y, w = this.image.width, h = this.image.height, g, count = 0;
  // randomly chooses a position
  // test that position ( ran.uniform() < alpha )
  // if true, save position
  // if false, tries again and i--
  // this is wrong, because it is minimum o(n) and max o(n^n)
  while( count !== this.steps ) {
    x = this.ran.random( w );
    y = this.ran.random( h );

    g = this.image.get( x, y );

    if( this.ran.random( 255 ) < g[ 3 ] ) {
      this.fromVerts[ count ] = some.vec2.create( x, y );

      this.toVerts[ count ] = some.vec2.create( 0, 1 );

      this.originVerts[ count ] = some.vec2.clone( this.fromVerts[ count ] );
      this.originHeadings[ count ] = some.vec2.heading( this.toVerts[ count ] );
      count++;
    }
  }

  return this;
};

some.clip = clip;

module.exports = some;