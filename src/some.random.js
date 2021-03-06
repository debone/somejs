'use strict';

var some = require( './some.core' );

/**
 * Seedable random number generator functions.
 * @version 1.0.0
 * @license Public Domain
 *
 * @example
 * var rng = new RNG('Example');
 * rng.random(40, 50);  // =>  42
 * rng.uniform();       // =>  0.7972798995050903
 * rng.normal();        // => -0.6698504543216376
 * rng.exponential();   // =>  1.0547367609131555
 * rng.poisson(4);      // =>  2
 * rng.gamma(4);        // =>  2.781724687386858
 */

/**
 * @param {String} seed A string to seed the generator.
 * @constructor
 */
var RC4 = function ( seed ) {
  this.s = new some.Array( 256 );
  this.i = 0;
  this.j = 0;

  for ( var i = 0; i < 256; i++ ) {
    this.s[ i ] = i;
  }

  if ( seed ) {
    this.mix( seed );
  }
};

/**
 * Get the underlying bytes of a string.
 * @param {string} string
 * @returns {Array} An array of bytes
 */
RC4.getStringBytes = function( string ) {
  var output = [ ];
  for ( var i = 0; i < string.length; i++ ) {
    var c = string.charCodeAt( i );
    var bytes = [ ];
    do {
      bytes.push( c & 0xFF );
      c = c >> 8;
    } while ( c > 0 );
    output = output.concat( bytes.reverse( ) );
  }
  return output;
};

RC4.prototype._swap = function( i, j ) {
  var tmp = this.s[ i ];
  this.s[ i ] = this.s[ j ];
  this.s[ j ] = tmp;
};

/**
 * Mix additional entropy into this generator.
 * @param {String} seed
 */
RC4.prototype.mix = function( seed ) {
  var input = RC4.getStringBytes( seed );
  var j = 0;
  for ( var i = 0; i < this.s.length; i++ ) {
    j += this.s[ i ] + input[ i % input.length ];
    j %= 256;
    this._swap( i, j );
  }
};

/**
 * @returns {number} The next byte of output from the generator.
 */
RC4.prototype.next = function() {
  this.i = ( this.i + 1 ) % 256;
  this.j = ( this.j + this.s[ this.i ] ) % 256;
  this._swap( this.i, this.j );
  return this.s[ ( this.s[ this.i ] + this.s[ this.j ] ) % 256 ];
};


/**
 * Create a new random number generator with optional seed. If the
 * provided seed is a function (i.e. Math.random) it will be used as
 * the uniform number generator.
 * @param seed An arbitrary object used to seed the generator.
 * @constructor
 */
var random = function ( seed ) {
  if ( typeof seed === "undefined" ) {
    seed = '' + Math.random( ) + Date.now( );
  } 
  else if ( typeof seed === "function" ) {
    // Use it as a uniform number generator
    this.uniform = seed;
    this.nextByte = function ( ) {
      return ~~( this.uniform() * 256 );
    };
    seed = null;
  } 
  else if ( Object.prototype.toString.call( seed ) !== "[object String]" ) {
    seed = JSON.stringify( seed );
  }

  this._normal = null;

  if ( seed ) {
    this._state = new RC4( seed );
  } 
  else {
    this._state = null;
  }
};

/**
 * @returns {number} Uniform random number between 0 and 255.
 */
random.prototype.nextByte = function ( ) {
    return this._state.next( );
};

/**
 * @returns {number} Uniform random number between 0 and 1.
 */
random.prototype.uniform = function ( ) {
    var BYTES = 7; // 56 bits to make a 53-bit double
    var output = 0;
    for ( var i = 0; i < BYTES; i++ ) {
        output *= 256;
        output += this.nextByte( );
    }
    return output / ( Math.pow( 2, BYTES * 8 ) - 1 );
};

/**
 * Produce a random integer within [n, m).
 * @param {number} [n=0]
 * @param {number} m
 *
 */
random.prototype.random = function( n, m ) {
    if ( typeof n === "undefined" ) {
        return this.uniform( );
    } 
    else if ( typeof m === "undefined" ) {
        m = n;
        n = 0;
    }

    return n + Math.floor( this.uniform( ) * ( m - n ) );
};

/**
 * Generates numbers using this.uniform() with the Box-Muller transform.
 * @returns {number} Normally-distributed random number of mean 0, variance 1.
 */
random.prototype.normal = function( ) {
    if ( this._normal !== null ) {
        var n = this._normal;
        this._normal = null;
        return n;
    } else {
        var x = this.uniform( ) || Math.pow( 2, -53 ); // can't be exactly 0
        var y = this.uniform( );
        this._normal = Math.sqrt( -2 * Math.log( x ) ) * Math.sin( 2 * Math.PI * y );
        return Math.sqrt( -2 * Math.log( x ) ) * Math.cos( 2 * Math.PI * y );
    }
};

/**
 * Generates numbers using this.uniform().
 * @returns {number} Number from the exponential distribution, lambda = 1.
 */
random.prototype.exponential = function( ) {
    return -Math.log( this.uniform( ) || Math.pow( 2, -53 ) );
};

/**
 * Generates numbers using this.uniform() and Knuth's method.
 * @param {number} [mean=1]
 * @returns {number} Number from the Poisson distribution.
 */
random.prototype.poisson = function( mean ) {
    var L = Math.exp( - ( mean || 1 ) );
    var k = 0, p = 1;
    do {
        k++;
        p *= this.uniform( );
    } while ( p > L );
    return k - 1;
};

/**
 * Generates numbers using this.uniform(), this.normal(),
 * this.exponential(), and the Marsaglia-Tsang method.
 * @param {number} a
 * @returns {number} Number from the gamma distribution.
 */
random.prototype.gamma = function( a ) {
  var v, x, u, x2;
  var d = ( a < 1 ? 1 + a : a ) - 1 / 3;
  var c = 1 / Math.sqrt( 9 * d );
  do {
      do {
          x = this.normal( );
          v = Math.pow( c * x + 1, 3 );
      } while ( v <= 0 );
      u = this.uniform( );
      x2 = Math.pow( x, 2 );
  } while ( u >= 1 - 0.0331 * x2 * x2 &&
           Math.log( u ) >= 0.5 * x2 + d * ( 1 - v + Math.log( v ) ) );
  if ( a < 1 ) {
      return d * v * Math.exp( this.exponential( ) / -a );
  } 
  else {
      return d * v;
  }
};

some.random = random;
module.exports = some;