'use strict';

var some = require( './some.core' );

/**
 * vec 2 
 * based on p5.js, gl-Matrix.js and http://media.tojicode.com/sfjs-vectors/
 *
 * Objects for large number of vectors ( class )
 * Typed Arrays for reuse ( static )
 */

var vec2 = function ( x, y ) {
  this.x = x;
  this.y = y;

  return this;
};

vec2.create = function( a, b ) {
  var out = new some.Array( 2 );
  out[ 0 ] = a || 0;
  out[ 1 ] = b || 0;

  return out;
};


/**
 * clone
 */
vec2.prototype.clone = function ( ) {
  return new vec2( this.x, this.y );
};

vec2.clone = function( a ) {
  var out = new some.Array( 2 );
  out[ 0 ] = a[ 0 ];
  out[ 1 ] = a[ 1 ];

  return out;
};


/**
 * copy
 */
vec2.prototype.copy = function ( v ) {
  this.x = v.x;
  this.y = v.y;

  return this;
};

vec2.copy = function ( a, out ) {
  out[ 0 ] = a[ 0 ];
  out[ 1 ] = a[ 1 ];
};


/**
 * set
 */
vec2.prototype.set = function ( x, y ) {
  this.x = x || 0;
  this.y = y || 0;

  return this;
};

vec2.set = function( a, b, out ) {
  out[ 0 ] = a;
  out[ 1 ] = b;
};


/**
 * len
 */
vec2.prototype.len = function ( ) {
  var x = this.x,
      y = this.y;
  return Math.sqrt( x * x + y * y );
};

vec2.len = function ( a ) {
  var x = a[ 0 ],
      y = a[ 1 ];
  return Math.sqrt( x * x + y * y );
};

/**
 * setLen
 */
vec2.prototype.setLen = function ( len ) {
  return this.normalize( ).mult( len );
}

vec2.setLen = function ( a, b, out ) {
  vec2.normalize( a, out );
  vec2.scale( out, b, out );
}

/**
 * normalize
 */
vec2.prototype.normalize = function ( ) {
  var len = this.len( );
  if ( len > 0 ) {
    len = 1 / len;
    this.x *= len;
    this.y *= len;
  }
  return this;
};

vec2.normalize = function( a, out ) {
    var len = vec2.len( a );
    if ( len > 0 ) {
        len = 1 / len;
        out[ 0 ] = a[ 0 ] * len;
        out[ 1 ] = a[ 1 ] * len;
    }
};


/**
 * add
 */
vec2.prototype.add = function ( v ) {
  this.x += v.x;
  this.y += v.y;

  return this;
};

vec2.add = function ( a, b, out ) {
  out[ 0 ] = a[ 0 ] + b[ 0 ];
  out[ 1 ] = a[ 1 ] + b[ 1 ];
};


/**
 * subtract
 */
vec2.prototype.subtract = function ( v ) {
  this.x -= v.x;
  this.y -= v.y;

  return this;
};

vec2.subtract = function ( a, b, out ) {
  out[ 0 ] = a[ 0 ] - b[ 0 ];
  out[ 1 ] = a[ 1 ] - b[ 1 ];
};

// aliases
vec2.prototype.sub = vec2.prototype.subtract;
vec2.sub = vec2.subtract;


/**
 * scale
 */
vec2.prototype.scale = function ( v ) {
  this.x *= v;
  this.y *= v;

  return this;
};

vec2.scale = function( a, b, out ) {
  out[ 0 ] = a[ 0 ] * b;
  out[ 1 ] = a[ 1 ] * b;
};

// aliases
vec2.prototype.mult = vec2.prototype.scale;
vec2.mult = vec2.scale;


/**
 * min
 */
vec2.prototype.min = function ( v1, v2 ) {
  var x = Math.min( v1.x, v2.x ),
      y = Math.min( v1.y, v2.y );

  return new vec2( x, y );  
};

vec2.min = function ( a, b, out ) {
  out[ 0 ] = Math.min( a[ 0 ], b[ 0 ] );
  out[ 1 ] = Math.min( a[ 1 ], b[ 1 ] );
};


/**
 * max
 */
vec2.prototype.max = function ( v1, v2 ) {
  var x = Math.max( v1.x, v2.x ),
      y = Math.max( v1.y, v2.y );
  
  return new vec2( x, y );
};

vec2.max = function ( a, b, out ) {
  out[0] = Math.max( a[ 0 ], b[ 0 ] );
  out[1] = Math.max( a[ 1 ], b[ 1 ] );
};


/**
 * euclidian distance
 */
vec2.prototype.distance = function ( v ) {
  var x = v.x - this.x,
      y = v.y - this.y;
  return Math.sqrt( x * x + y * y );
};

vec2.distance = function ( a, b ) {
  var x = b[ 0 ] - a[ 0 ],
      y = b[ 1 ] - a[ 1 ];
  return Math.sqrt( x * x + y * y );
};
// aliases
vec2.prototype.dist = vec2.prototype.distance;
vec2.dist = vec2.distance;


/**
 * negate
 */
vec2.prototype.negate = function ( ) {
  this.x = - this.x;
  this.y = - this.y;

  return this;
};

vec2.negate = function ( a, out ) {
  out[ 0 ] = -a[ 0 ];
  out[ 1 ] = -a[ 1 ];
};


/**
 * inverse
 */
vec2.prototype.inverse = function ( ) {
  this.x = 1.0 / this.x;
  this.y = 1.0 / this.y;

  return this;
};

vec2.inverse = function( a, out ) {
  out[ 0 ] = 1.0 / a[ 0 ];
  out[ 1 ] = 1.0 / a[ 1 ];
};


/**
 * dot product
 */
vec2.prototype.dot = function ( v ) { 
  return this.x * v.x + this.y * v.y;
};

vec2.dot = function ( a, b ) {
  return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ];
};


/**
 * heading
 */
vec2.prototype.heading = function ( ) {
  return Math.atan2( this.x, this.y );
};

vec2.heading = function ( a ) {
  return Math.atan2( a[ 0 ], a[ 1 ] );
};


/**
 * rotate
 */
vec2.prototype.rotate = function( angle ) {
  var heading = this.heading() + angle;
  var len = this.len();

  this.x = Math.cos( heading ) * len;
  this.y = Math.sin( heading ) * len;

  return this;
};

vec2.rotate = function ( a, angle, out ) {
  var heading = vec2.heading( a ) + angle;
  var len = vec2.len( a );

  out[ 0 ] = Math.cos( heading ) * len;
  out[ 1 ] = Math.sin( heading ) * len;

  return this;
};


/**
 * linear interpolation
 */
vec2.prototype.lerp = function ( v, t ) {
  var x = this.x,
      y = this.y;
  x = x + t * ( v.x - x );
  y = y + t * ( v.y - y );

  return new vec2( x, y );
};

vec2.lerp = function ( a, b, t, out ) {
    var ax = a[ 0 ],
        ay = a[ 1 ];
    out[ 0 ] = ax + t * ( b[ 0 ] - ax );
    out[ 1 ] = ay + t * ( b[ 1 ] - ay );
    return out;
};

some.vec2 = vec2;
module.exports = some;