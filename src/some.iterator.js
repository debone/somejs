'use strict';

var some = require( './some.core' );

var iterator = function ( world, loopable ) {
  this.length = 0;
  this.index = -1;
  this.loopable = loopable || false;

  this.selector = some.ORDER; //ordened!!
};

iterator.prototype.setSelector = function ( selector, seed ) {
  if ( selector === some.NOISE ) {
    this.selectorInstance = new some.noise( seed );
  }
  else if ( selector !== some.ORDER ) {
    this.selectorInstance = new some.random( seed );
  }
  else {
    // ORDER has no instance
    this.selectorInstance = undefined;
  }
};

iterator.prototype.getValue = function ( ) {
  var value;
  switch ( this.selector ) {
    case some.ORDER:
      value = this.index;
      break;
    case some.RANDOM:
      value = this.selectorInstance.random( this.length );
      break;
    case some.NORMAL:
      value = this.length * this.selectorInstance.normal( );
      break;
    case some.EXPONENTIAL:
      value = this.length * this.selectorInstance.exponential( );
      break;
    case some.POISSON:
      value = this.length * this.selectorInstance.poisson( );
      break;
    case some.GAMMA:
      value = this.length * this.selectorInstance.gamma( 0.99 );
      break;
    case some.NOISE:
      value = this.length * this.selectorInstance.get( this.index );
      break;
  }

  return Math.floor( value );
};

iterator.prototype.next = function ( ) {
  if ( this.index + 1 < this.length ) {
    return true;
  }
  return false;
};

// get 
// -> add one to index
// -> get one value between zero and length
// -> return iterable 
iterator.prototype.get = function ( ) {
  if ( this.next( ) ) {
    this.index = ( ( this.index + 1 < this.length ) || !this.loopable ) ? this.index + 1 : 0;
    return this.retrieve( this.getValue( ) );
  }

  return false;
};

iterator.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

some.iterator = iterator;

module.exports = some;