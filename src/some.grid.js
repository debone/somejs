'use strict';

var some = require( './some.core' );

var grid = function ( world, width, height, marginX, marginY ) {
  some.layout.call( this, world, true );

  this.horizontal = marginX || 1;
  this.vertical = marginY || marginX || 1;

  this.setSize( width, height );
  this.generate();

  return this;
};

grid.prototype = Object.create( some.layout.prototype );

grid.prototype.setSize = function ( w, h ) {
  w = w || 1;
  h = h || w;
  this.steps = w * h;
  this.width = w;
};

grid.prototype.generate = function ( steps ) {
  var t, s;

  this.initArrays( steps || this.steps );

  for( var i = 0; i < this.steps; i++ ) {
    //boom new vert
    this.fromVerts[ i ] = some.vec2.create(
      this.horizontal * ( i % this.width ) , 
      this.vertical * Math.floor( i / this.width)
    );

    this.toVerts[ i ] = some.vec2.create( 0, 1 );

    this.originVerts[ i ] = some.vec2.clone( this.fromVerts[ i ] );
    this.originHeadings[ i ] = some.vec2.heading( this.toVerts[ i ] );
  }

  return this;
};

grid.prototype.setMargin = function ( horizontal, vertical ) {
  this.horizontal = horizontal || this.horizontal;
  this.vertical = vertical || horizontal || this.vertical;

  this.generate( );

  return this;
};

some.grid = grid;

module.exports = some;