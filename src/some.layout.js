'use strict';

var some = require( './some.core' );

var layout = function ( world, rigid ) {
  some.iterator.call( this, world );

  this.initArrays = rigid ? this.initArraysFlexible : this.initArraysStatic;

  return this;
};

layout.prototype = Object.create( some.iterator.prototype );

// TODO this is not using Iteraaators :X is it?
layout.prototype.initArraysStatic = function ( steps ) {
  //iterator
  this.length = steps;

  this.steps = steps;

  this.fromVerts = new some.Array( steps );
  this.toVerts = new some.Array( steps );

  this.originVerts = new some.Array( steps );
  this.originHeadings = new some.Array( steps );
};

layout.prototype.initArraysFlexible = function ( steps ) {
  //iterator
  this.length = steps;

  this.steps = steps;

  this.fromVerts = [ ];
  this.toVerts = [ ];

  this.originVerts = [ ];
  this.originHeadings = [ ];
};

layout.prototype.rotateVerts = function ( angle ) {
  angle = angle * some.toRadians;
  for ( var i = 0, l = this.length; i < l; i++ ) {
    some.vec2.rotate( this.toVerts[ i ], this.originHeadings[ i ] + angle - some.vec2.heading( this.toVerts[ i ] ), this.toVerts[ i ] );
  }

  return this;
};

layout.prototype.moveVerts = function ( movement ) {
  var angle;
  for ( var i = 0, l = this.length; i < l; i++ ) {
    angle = some.vec2.heading( this.toVerts[ i ] ) - Math.abs( some.vec2.heading( movement ) );
    some.vec2.rotate( movement, angle, movement );
    some.vec2.copy( this.originVerts[ i ], this.fromVerts[ i ] );
    some.vec2.add( this.fromVerts[ i ], movement, this.fromVerts[ i ] );
    some.vec2.rotate( movement, - angle, movement );
  }

  return this;
};

layout.prototype.retrieve = function ( index ) {
  return {
    from: this.fromVerts[ index ],
    to: this.toVerts[ index ]
  };
};

some.layout = layout;

module.exports = some;