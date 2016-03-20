(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

window.some = require( './src/some.core' );

var DEBUG = ( typeof DEBUG === "undefined") ? true : false;

if ( DEBUG ) window.DEBUG = true;

require( './src/some.random' );
require( './src/some.noise' );
require( './src/some.vec2' );

require( './src/some.iterator' );

require( './src/some.drawable' );
require( './src/some.image' );
require( './src/some.canvas' );
require( './src/some.shape' );

require( './src/some.layout' );
require( './src/some.grid' );
require( './src/some.spine' );
require( './src/some.clip' );

require( './src/some.colorspool' );
require( './src/some.drawablespool' );

require( './src/some.group' );

module.exports = some;
},{"./src/some.canvas":2,"./src/some.clip":3,"./src/some.colorspool":4,"./src/some.core":5,"./src/some.drawable":6,"./src/some.drawablespool":7,"./src/some.grid":8,"./src/some.group":9,"./src/some.image":10,"./src/some.iterator":11,"./src/some.layout":12,"./src/some.noise":13,"./src/some.random":14,"./src/some.shape":15,"./src/some.spine":16,"./src/some.vec2":17}],2:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var canvas = function ( world, width, height ) {
  some.drawable.call( this, world );

  this.canvas = this.world.createGraphics( width || 150, height || 150 );

  return this;
};

canvas.prototype = Object.create( some.drawable.prototype );

canvas.prototype.representation = function ( ) {
  this.world.image( this.canvas, 0, 0 );
};

some.canvas = canvas;

module.exports = some;
},{"./some.core":5}],3:[function(require,module,exports){
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
},{"./some.core":5}],4:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var colorsPool = function ( world, options ) {
  some.iterator.call( this, world, true );

  this.colors = [ ];

  options = options || { };
};

colorsPool.prototype = Object.create( some.iterator.prototype );

colorsPool.prototype.add = function ( color, count ) {
  count = count || 1;
  // TODO some.color
  if ( color instanceof p5.Color ) {
    while ( count -- ) {
      this.length++;
      this.colors[ this.colors.length ] = color;
    }
  }
  else {
    while ( count -- ) {
      this.length++;
      this.colors[ this.colors.length ] = this.world.color( color );
    }
  }

  return this;
};

colorsPool.prototype.remove = function ( index ) {
  this.length--;
  if ( index > -1 ) {
    this.colors = this.colors.splice( index, 1 );
  }

  return this;
};

colorsPool.prototype.clear = function ( ) {
  this.colors = [ ];

  this.length = 0;
  this.reset();

  return this;
};

colorsPool.prototype.retrieve = function ( index ) {
  return this.colors[ index ];
};

/*colorsPool.prototype.fill = function ( ) {
  this.next();
  this.world.fill( this.get() );
};

colorsPool.prototype.stroke = function ( ) {
  this.next();
  this.world.stroke( this.get() );
};

colorsPool.prototype.fillAndStroke = function ( ) {
  this.fill();
  this.stroke();
};*/

some.colorsPool = colorsPool;

module.exports = some;
},{"./some.core":5}],5:[function(require,module,exports){
'use strict';

var some = function ( ) { };

some.Array = ( typeof Float32Array !== 'undefined' ) ? Float32Array : Array;

// Conversion Multiplications
some.toRadians = Math.PI / 180;
some.toDegrees = 1 / some.toRadians;

// CONSTANTS 
// grids
some.GRID = 1;
some.SPINE = 2;

// random & noise
some.ORDER = 3;
some.NOISE = 4;
some.RANDOM = 5;
some.NORMAL = 6;
some.EXPONENTIAL = 7;
some.POISSON = 8;
some.GAMMA = 9;


module.exports = some;
},{}],6:[function(require,module,exports){
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
},{"./some.core":5}],7:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var drawablesPool = function ( world, options ) {
  some.iterator.call( this, world, true );

  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  this.drawFunction = false;

  options = options || { };

  if ( options.draw ) { 
    // Unique draw function
    this.drawFunction = options.draw;
  }
};

drawablesPool.prototype = Object.create( some.iterator.prototype );

drawablesPool.prototype.add = function ( drawable, count, drawableFunction ) {
  count = count || 1;

  // TODO Move this to iterator ( drawablesPool.prototype.insert & iterator.prototype.add )
  this.length += count;
  
  if ( drawable instanceof some.drawable ) {
    while ( count -- ) {
      this.drawables[ this.drawables.length ] = drawable;
      this.drawablesFunctions[ this.drawablesFunctions.length ] = drawableFunction || function ( ) { };
    }
  }

  return this;
};

drawablesPool.prototype.remove = function ( index ) {
  // TODO Same as add
  this.length--;

  if ( index > -1 ) {
    this.drawables = this.drawables.splice( index, 1 );
    this.drawablesFunctions = this.drawablesFunctions.splice( index, 1 );
  }

  return this;
};

drawablesPool.prototype.clear = function ( ) {
  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  this.length = 0;
  this.reset();

  return this;
};

drawablesPool.prototype.retrieve = function ( index ) { 
  return {
    drawable: this.drawables[ index ],
    fn: ( this.drawFunction ) ? this.drawFunction : this.drawablesFunctions[ index ]
  };
};

some.drawablesPool = drawablesPool;

module.exports = some;
},{"./some.core":5}],8:[function(require,module,exports){
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
},{"./some.core":5}],9:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var group = function ( world, options ) {
  some.drawable.call( this, world );

  this.layout = {
    next: function () { }
  };

  this.colorsPool = {
    next: function () { }
  };

  this.drawablesPool = {};

  options = options || { };

  if ( typeof options.layout !== "undefined" ) {
    this.layout = options.layout;
  }
  
  if ( typeof options.colorsPool !== "undefined" ||
       typeof options.colorspool !== "undefined" ||
       typeof options.colors !== "undefined"
    ) {
    this.colorsPool = options.colorsPool || options.colorspool || options.colors;
  }

  if ( typeof options.drawablesPool !== "undefined" ||
       typeof options.drawablespool !== "undefined" ||
       typeof options.drawables !== "undefined"
    ) {
    this.drawablesPool = options.drawablesPool || options.drawablespool || options.drawables;
  }

  return this; 
};

group.prototype = Object.create( some.drawable.prototype );

group.prototype.setDrawablesPool = function ( drawablesPool ) {
  this.drawablesPool = drawablesPool;
  return this;
};

group.prototype.setColorsPool = function ( colorsPool ) {
  this.colorsPool = colorsPool;
  return this;
};

group.prototype.setLayout = function ( layout ) {
  this.layout = layout;
  return this;
};

group.prototype.representation = function ( ) {
  var n, c, p;
  this.layout.reset();
  //this.colorsPool.reset();
  while ( this.layout.next() ) {
    n = this.layout.get();
    p = this.drawablesPool.get();
    
    p.drawable.setPosition( n.from[ 0 ], n.from[ 1 ] );
    p.drawable.axis( n.to[ 0 ], n.to[ 1 ] );

    this.world.fill( this.colorsPool.get() );
    this.world.stroke( this.colorsPool.get() );

    if ( ! p.fn( this.world, p.drawable ) ) {
      p.drawable.draw();
    }
  }
};

some.group = group;

module.exports = some;
},{"./some.core":5}],10:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var image = function ( world, imgPath ) {
  some.drawable.call( this, world );

  this.image = this.world.loadImage( imgPath );
  
  return this;
};

image.prototype = Object.create( some.drawable.prototype );

image.prototype.representation = function ( ) {
  this.world.image( this.image, 0,0 );
};

some.image = image;

module.exports = some;
},{"./some.core":5}],11:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var iterator = function ( world, loopable ) {
  this.world = world;
  this.length = 0;
  this.index = -1;
  this.count = 0;
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

  this.selector = selector;

  return this;
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
      value = this.length * this.selectorInstance.get( this.count, 1 );
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
  if ( this.next( ) || this.loopable ) {
    this.index = ( ( this.index + 1 < this.length ) || !this.loopable ) ? this.index + 1 : 0;
    this.count++;
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
},{"./some.core":5}],12:[function(require,module,exports){
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
},{"./some.core":5}],13:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

/** 
 * PerlinSimplex 1.2
 * Ported from Stefan Gustavson's java implementation by Sean McCullough banksean@gmail.com
 * http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
 * Read Stefan's excellent paper for details on how this code works.
 * octaves and falloff implementation (and passing jslint) by Ron Valstar
 * also implemented Karsten Schmidt's implementation
 */

var noise = function( seed ) {

  this.F2 = 0.5*(Math.sqrt(3)-1);
  this.G2 = (3-Math.sqrt(3))/6;
  this.G22 = 2*this.G2 - 1;
  this.F3 = 1/3;
  this.G3 = 1/6;
  this.F4 = (Math.sqrt(5) - 1)/4;
  this.G4 = (5 - Math.sqrt(5))/20;
  this.G42 = this.G4*2;
  this.G43 = this.G4*3;
  this.G44 = this.G4*4 - 1;

  // Gradient vectors for 3D (pointing to mid points of all edges of a unit cube)
  this.aGrad3 = [ [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1] ];

  // Gradient vectors for 4D (pointing to mid points of all edges of a unit 4D hypercube)
  this.grad4 = [ [0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0] ];


  // A lookup table to traverse the simplex around a given point in 4D. 
  // Details can be found where this table is used, in the 4D noise method. 
  this.simplex = [ [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0] ];
  
  // To remove the need for index wrapping, double the permutation table length
  //this.aPerm;
  //this.aOctFreq; // frequency per octave
  //this.aOctPers; // persistence per octave

  this.iOctaves = 1;
  this.fPersistence = 0.5;
  this.fPersMax = 0; // 1 / max persistence

  this.random = new some.random( seed );

  // init
  this.setPerm();
  this.octFreqPers();
};

// 1D dotproduct
noise.prototype.dot1 = function dot1(g, x) { 
  return g[0]*x;
};

// 2D dotproduct
noise.prototype.dot2 = function dot2(g, x, y) {
  return g[0]*x + g[1]*y;
};

// 3D dotproduct
noise.prototype.dot3 = function dot3(g, x, y, z) {
  return g[0]*x + g[1]*y + g[2]*z;
};

// 4D dotproduct
noise.prototype.dot4 = function dot4(g, x, y, z, w) {
  return g[0]*x + g[1]*y + g[2]*z + g[3]*w;
};

// noise2d
noise.prototype.twod = function (x, y) {
  var g;
  var n0, n1, n2;
  var s;
  var i, j;
  var t;
  var x0, y0;
  var i1, j1;
  var x1, y1;
  var x2, y2;
  var ii, jj;
  var gi0, gi1, gi2;
  var t0, t1, t2;

  // Skew the input space to determine which simplex cell we're in 
  s = (x+y)*this.F2; // Hairy factor for 2D 
  i = Math.floor(x+s); 
  j = Math.floor(y+s); 
  t = (i+j)*this.G2; 
  x0 = x - (i - t); // Unskew the cell origin back to (x,y) space 
  y0 = y - (j - t); // The x,y distances from the cell origin 
  // For the 2D case, the simplex shape is an equilateral triangle. 
  // Determine which simplex we are in. 
  // Offsets for second (middle) corner of simplex in (i,j) coords 
  if (x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    i1 = 1;
    j1 = 0;
  }  else { // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    i1 = 0;
    j1 = 1;
  }
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
  // c = (3-sqrt(3))/6 
  x1 = x0 - i1 + this.G2; // Offsets for middle corner in (x,y) unskewed coords 
  y1 = y0 - j1 + this.G2; 
  x2 = x0 + this.G22; // Offsets for last corner in (x,y) unskewed coords 
  y2 = y0 + this.G22; 
  // Work out the hashed gradient indices of the three simplex corners 
  ii = i&255; 
  jj = j&255; 
  // Calculate the contribution from the three corners 
  t0 = 0.5 - x0*x0-y0*y0; 
  if (t0<0) {
    n0 = 0; 
  } else { 
    t0 *= t0; 
    gi0 = this.aPerm[ii+this.aPerm[jj]] % 12; 
    n0 = t0 * t0 * this.dot2(this.aGrad3[gi0], x0, y0);  // (x,y) of aGrad3 used for 2D gradient 
  } 
  t1 = 0.5 - x1*x1-y1*y1; 
  if (t1<0) {
    n1 = 0; 
  } else { 
    t1 *= t1; 
    gi1 = this.aPerm[ii+i1+this.aPerm[jj+j1]] % 12; 
    n1 = t1 * t1 * this.dot2(this.aGrad3[gi1], x1, y1); 
  }
  t2 = 0.5 - x2*x2-y2*y2; 
  if (t2<0) {
    n2 = 0; 
  } else { 
    t2 *= t2; 
    gi2 = this.aPerm[ii+1+this.aPerm[jj+1]] % 12; 
    n2 = t2 * t2 * this.dot2(this.aGrad3[gi2], x2, y2); 
  } 
  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to return values in the interval [0,1].
  return 70 * (n0 + n1 + n2);
};

// noise3d
noise.prototype.threed = function threed(x,y,z) {
  var g;
  var n0, n1, n2, n3;
  var s;
  var i, j, k;
  var t;
  var x0, y0, z0;
  var i1, j1, k1;
  var i2, j2, k2;
  var x1, y1, z1;
  var x2, y2, z2;
  var x3, y3, z3;
  var ii, jj, kk;
  var gi0, gi1, gi2, gi3;
  var t0, t1, t2, t3;

  // Noise contributions from the four corners 
  // Skew the input space to determine which simplex cell we're in 
  s = (x+y+z)*this.F3; // Very nice and simple skew factor for 3D 
  i = Math.floor(x+s); 
  j = Math.floor(y+s); 
  k = Math.floor(z+s); 
  t = (i+j+k)*this.G3;
  x0 = x - (i - t); // Unskew the cell origin back to (x,y,z) space 
  y0 = y - (j - t); // The x,y,z distances from the cell origin 
  z0 = z - (k - t); 

  // For the 3D case, the simplex shape is a slightly irregular tetrahedron. 
  // Determine which simplex we are in. 
  // Offsets for second corner of simplex in (i,j,k) coords 
  // Offsets for third corner of simplex in (i,j,k) coords 
  if (x0>=y0) { 
    if (y0>=z0) { // X Y Z order
      i1 = 1;
      j1 = 0;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    } else if (x0>=z0) { // X Z Y order
      i1 = 1;
      j1 = 0;
      k1 = 0;
      i2 = 1;
      j2 = 0;
      k2 = 1;
    } else { // Z X Y order
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 1;
      j2 = 0;
      k2 = 1;
    } 
  } else { // x0<y0 
    if (y0<z0) { // Z Y X order
      i1 = 0;
      j1 = 0;
      k1 = 1;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else if (x0<z0) { // Y Z X order
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 0;
      j2 = 1;
      k2 = 1;
    } else { // Y X Z order
      i1 = 0;
      j1 = 1;
      k1 = 0;
      i2 = 1;
      j2 = 1;
      k2 = 0;
    }
  } 

  // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z), 
  // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and 
  // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where 
  // c = 1/6.
  x1 = x0 - i1 + this.G3; // Offsets for second corner in (x,y,z) coords 
  y1 = y0 - j1 + this.G3; 
  z1 = z0 - k1 + this.G3; 
  x2 = x0 - i2 + this.F3; // Offsets for third corner in (x,y,z) coords 
  y2 = y0 - j2 + this.F3; 
  z2 = z0 - k2 + this.F3; 
  x3 = x0 - 0.5; // Offsets for last corner in (x,y,z) coords 
  y3 = y0 - 0.5; 
  z3 = z0 - 0.5; 

  // Work out the hashed gradient indices of the four simplex corners 
  ii = i&255; 
  jj = j&255; 
  kk = k&255; 

  // Calculate the contribution from the four corners 
  t0 = 0.6 - x0*x0 - y0*y0 - z0*z0; 
  if (t0<0) {
    n0 = 0; 
  } else { 
    t0 *= t0; 
    gi0 = this.aPerm[ii+this.aPerm[jj+this.aPerm[kk]]] % 12; 
    n0 = t0 * t0 * this.dot3(this.aGrad3[gi0], x0, y0, z0); 
  }
  t1 = 0.6 - x1*x1 - y1*y1 - z1*z1; 
  if (t1<0) {
    n1 = 0; 
  } else { 
    t1 *= t1; 
    gi1 = this.aPerm[ii+i1+this.aPerm[jj+j1+this.aPerm[kk+k1]]] % 12; 
    n1 = t1 * t1 * this.dot3(this.aGrad3[gi1], x1, y1, z1); 
  } 
  t2 = 0.6 - x2*x2 - y2*y2 - z2*z2; 
  if (t2<0) {
    n2 = 0; 
  } else { 
    t2 *= t2; 
    gi2 = this.aPerm[ii+i2+this.aPerm[jj+j2+this.aPerm[kk+k2]]] % 12; 
    n2 = t2 * t2 * this.dot3(this.aGrad3[gi2], x2, y2, z2); 
  } 
  t3 = 0.6 - x3*x3 - y3*y3 - z3*z3; 
  if (t3<0) {
    n3 = 0; 
  } else { 
    t3 *= t3; 
    gi3 = this.aPerm[ii+1+this.aPerm[jj+1+this.aPerm[kk+1]]] % 12; 
    n3 = t3 * t3 * this.dot3(this.aGrad3[gi3], x3, y3, z3); 
  } 

  // Add contributions from each corner to get the final noise value. 
  // The result is scaled to stay just inside [0,1] 
  return 32 * (n0 + n1 + n2 + n3);
};

// noise4d
noise.prototype.fourd = function fourd(x,y,z,w) {
  var g;
  var n0, n1, n2, n3, n4;
  var s;
  var c;
  var sc;
  var i, j, k, l;
  var t;
  var x0, y0, z0, w0;
  var i1, j1, k1, l1;
  var i2, j2, k2, l2;
  var i3, j3, k3, l3;
  var x1, y1, z1, w1;
  var x2, y2, z2, w2;
  var x3, y3, z3, w3;
  var x4, y4, z4, w4;
  var ii, jj, kk, ll;
  var gi0, gi1, gi2, gi3, gi4;
  var t0, t1, t2, t3, t4;

  // from the five corners
  // Skew the (x,y,z,w) space to determine which cell of 24 simplices
  s = (x + y + z + w) * this.F4; // Factor for 4D skewing
  i = Math.floor(x + s);
  j = Math.floor(y + s);
  k = Math.floor(z + s);
  l = Math.floor(w + s);
  t = (i + j + k + l) * this.G4; // Factor for 4D unskewing
  x0 = x - (i - t); // The x,y,z,w distances from the cell origin
  y0 = y - (j - t);
  z0 = z - (k - t);
  w0 = w - (l - t);

  // For the 4D case, the simplex is a 4D shape I won't even try to describe.
  // To find out which of the 24 possible simplices we're in, we need to determine the magnitude ordering of x0, y0, z0 and w0.
  // The method below is a good way of finding the ordering of x,y,z,w and then find the correct traversal order for the simplex were in.
  // First, six pair-wise comparisons are performed between each possible pair of the four coordinates, and the results are used to add up binary bits for an integer index.
  c = 0;
  if (x0>y0) {
    c = 0x20;
  }
  if (x0>z0) {
    c |= 0x10;
  }
  if (y0>z0) {
    c |= 0x08;
  }
  if (x0>w0) {
    c |= 0x04;
  }
  if (y0>w0) {
    c |= 0x02;
  }
  if (z0>w0) {
    c |= 0x01;
  }

  // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some
  // order. Many values of c will never occur, since e.g. x>y>z>w makes
  // x<z, y<w and x<w impossible. Only the 24 indices which have non-zero
  // entries make any sense. We use a thresholding to set the coordinates
  // in turn from the largest magnitude. The number 3 in the "simplex"
  // array is at the position of the largest coordinate.
  sc = this.simplex[c];
  i1 = sc[0] >= 3 ? 1 : 0;
  j1 = sc[1] >= 3 ? 1 : 0;
  k1 = sc[2] >= 3 ? 1 : 0;
  l1 = sc[3] >= 3 ? 1 : 0;

  // The number 2 in the "simplex" array is at the second largest
  // coordinate.
  i2 = sc[0] >= 2 ? 1 : 0;
  j2 = sc[1] >= 2 ? 1 : 0;
  k2 = sc[2] >= 2 ? 1 : 0;
  l2 = sc[3] >= 2 ? 1 : 0;

  // The number 1 in the "simplex" array is at the second smallest
  // coordinate.
  i3 = sc[0] >= 1 ? 1 : 0;
  j3 = sc[1] >= 1 ? 1 : 0;
  k3 = sc[2] >= 1 ? 1 : 0;
  l3 = sc[3] >= 1 ? 1 : 0;
  // The fifth corner has all coordinate offsets = 1, so no need to look
  // that up.
  x1 = x0 - i1 + this.G4; // Offsets for second corner in (x,y,z,w)
  y1 = y0 - j1 + this.G4;
  z1 = z0 - k1 + this.G4;
  w1 = w0 - l1 + this.G4;

  x2 = x0 - i2 + this.G42; // Offsets for third corner in (x,y,z,w)
  y2 = y0 - j2 + this.G42;
  z2 = z0 - k2 + this.G42;
  w2 = w0 - l2 + this.G42;

  x3 = x0 - i3 + this.G43; // Offsets for fourth corner in (x,y,z,w)
  y3 = y0 - j3 + this.G43;
  z3 = z0 - k3 + this.G43;
  w3 = w0 - l3 + this.G43;

  x4 = x0 + this.G44; // Offsets for last corner in (x,y,z,w)
  y4 = y0 + this.G44;
  z4 = z0 + this.G44;
  w4 = w0 + this.G44;

  // Work out the hashed gradient indices of the five simplex corners
  ii = i&255;
  jj = j&255;
  kk = k&255;
  ll = l&255;

  // Calculate the contribution from the five corners
  t0 = 0.6 - x0*x0 - y0*y0 - z0*z0 - w0*w0;
  if (t0<0) {
    n0 = 0; 
  } else { 
    t0 *= t0;
    gi0 = this.aPerm[ii + this.aPerm[jj + this.aPerm[kk + this.aPerm[ll]]]]%32;
    n0 = t0*t0*this.dot4(this.grad4[gi0], x0, y0, z0, w0);
  }
  t1 = 0.6 - x1*x1 - y1*y1 - z1*z1 - w1*w1;
  if (t1<0) {
    n1 = 0; 
  } else { 
    t1 *= t1;
    gi1 = this.aPerm[ii + i1 + this.aPerm[jj + j1 + this.aPerm[kk + k1 + this.aPerm[ll + l1]]]]%32;
    n1 = t1*t1*this.dot4(this.grad4[gi1], x1, y1, z1, w1);
  }
  t2 = 0.6 - x2*x2 - y2*y2 - z2*z2 - w2*w2;
  if (t2<0) {
    n2 = 0; 
  } else { 
    t2 *= t2;
    gi2 = this.aPerm[ii + i2 + this.aPerm[jj + j2 + this.aPerm[kk + k2 + this.aPerm[ll + l2]]]]%32;
    n2 = t2*t2*this.dot4(this.grad4[gi2], x2, y2, z2, w2);
  }
  t3 = 0.6 - x3*x3 - y3*y3 - z3*z3 - w3*w3;
  if (t3<0) {
    n3 = 0; 
  } else { 
    t3 *= t3;
    gi3 = this.aPerm[ii + i3 + this.aPerm[jj + j3 + this.aPerm[kk + k3 + this.aPerm[ll + l3]]]]%32;
    n3 = t3*t3*this.dot4(this.grad4[gi3], x3, y3, z3, w3);
  }
  t4 = 0.6 - x4*x4 - y4*y4 - z4*z4 - w4*w4;
  if (t4<0) {
    n4 = 0; 
  } else { 
    t4 *= t4;
    gi4 = this.aPerm[ii + 1 + this.aPerm[jj + 1 + this.aPerm[kk + 1 + this.aPerm[ll + 1]]]]%32;
    n4 = t4*t4*this.dot4(this.grad4[gi4], x4, y4, z4, w4);
  }
  // Sum up and scale the result to cover the range [-1,1]
  return 27.0*(n0 + n1 + n2 + n3 + n4);
};

// setPerm
noise.prototype.setPerm = function ( ) {
  var i;
  var p = new some.Array( 256 );

  for ( i=0; i<256; i++ ) { 
    p[ i ] = Math.floor( this.random.uniform() * 256 );
  }

  // To remove the need for index wrapping, double the permutation table length 
  this.aPerm = new some.Array( 512 ); 
  for ( i=0; i<512; i++ ) {
    this.aPerm[ i ] = p[ i & 255 ];
  }
};

noise.prototype.setSeed = function ( seed ) {
  this.random = new some.random( seed );
  this.setPerm();
};

noise.prototype.octFreqPers = function ( ) {
  var fFreq, fPers;
  this.aOctFreq = new some.Array( this.iOctaves );
  this.aOctPers = new some.Array( this.iOctaves );
  this.fPersMax = 0;
  for ( var i = 0; i < this.iOctaves; i++ ) {
    fFreq = Math.pow( 2, i );
    fPers = Math.pow( this.fPersistence, i );
    this.fPersMax += fPers;
    this.aOctFreq[ i ] = fFreq;
    this.aOctPers[ i ] = fPers;
  }
  this.fPersMax = 1 / this.fPersMax;
};

noise.prototype.get = function ( x, y, z, w ) {
  var fFreq, fPers, fResult;
  fResult = 0;
  for ( var g = 0; g < this.iOctaves; g++ ) {
    fFreq = this.aOctFreq[ g ];
    fPers = this.aOctPers[ g ];
    switch ( arguments.length ) {
      case 4:  fResult += fPers * this.fourd( fFreq * x, fFreq * y, fFreq * z, fFreq * w ); break;
      case 3:  fResult += fPers * this.threed( fFreq * x, fFreq * y, fFreq * z ); break;
      default: fResult += fPers * this.twod( fFreq * x, fFreq * y );
    }
  }
  return ( fResult * this.fPersMax + 1 ) * 0.5;
};

noise.prototype.noiseDetail = function ( octaves, falloff ) {
  this.iOctaves = octaves || this.iOctaves;
  this.fPersistence = falloff || this.fPersistence;
  this.octFreqPers();
};

noise.prototype.toString = function ( ) {
  return "[object noise " + this.iOctaves + " " + this.fPersistence + "]";
};

some.noise = noise;
module.exports = some;
},{"./some.core":5}],14:[function(require,module,exports){
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
},{"./some.core":5}],15:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var shape = function ( world, shapeBeziers, shapeSize ) {
  some.drawable.call( this, world );

  this.shape = [ ];
  this.c1 = [ ];
  this.c2 = [ ];
  this.shapeSize = shapeBeziers.length;

  if ( shapeSize instanceof some.vec2 ) {
    this.sizeOriginal = shapeSize;
  }
  else {
    some.vec2.set( shapeSize.shift(), shapeSize.shift(), this.sizeOriginal );
  }

  this.shapeSize = Math.floor( this.shapeSize / 6 );

  this.shape.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );

  for ( var i = 0; i < this.shapeSize; i++ ) {
    this.c1.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.c2.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.shape.push( some.vec2.create( shapeBeziers.shift(), shapeBeziers.shift() ) );
  }

  return this;
};

shape.prototype = Object.create( some.drawable.prototype );

shape.prototype.representation = function ( ) {
  this.world.beginShape( );
    this.world.vertex( this.shape[ 0 ][ 0 ], this.shape[ 0 ][ 1 ] );
    for ( var i = 0; i < this.shapeSize; i++ ) {
      this.world.bezierVertex(
        this.c1[ i ][ 0 ], this.c1[ i ][ 1 ], 
        this.c2[ i ][ 0 ], this.c2[ i ][ 1 ], 
        this.shape[ i + 1 ][ 0 ], this.shape[ i + 1 ][ 1 ]
      );
    }
  this.world.endShape( );
};

some.shape = shape;

module.exports = some;
},{"./some.core":5}],16:[function(require,module,exports){
'use strict';

var some = require( './some.core' );

var spine = function ( world, shapeBeziers, shapeAxis, steps, precision ) {
  some.layout.call( this, world, true );
  some.shape.call( this, world, shapeBeziers, shapeAxis );

  this.shapeLength = [ ];
  this.shapePoints = [ ];

  this.shapeTotalLength = 0.0;

  this.init( precision );
  this.generate( steps );

  return this;
};

spine.prototype = Object.create( some.layout.prototype );

spine.prototype.init = function( precision ) {
  var step, x, y, lastX, lastY, dist;
  
  var temp = some.vec2.create();

  precision = precision || 70;

  for ( var i = 0; i < this.shapeSize; i++ ) {
    some.vec2.copy( this.shape[ i + 1 ], temp );
    this.shapeLength[ i ] = 0;
    this.shapePoints[ i ] = { };
    this.shapePoints[ i ].t = [ ];
    this.shapePoints[ i ].s = [ ];

    some.vec2.sub( temp, this.shape[ i ], temp );
    step = 1 / ( Math.floor( ( some.vec2.len( temp ) / 25 ) * precision ) + 1 );

    lastX = this.shape[ i ][ 0 ];
    lastY = this.shape[ i ][ 1 ];
    for ( var t = 0; t <= 1; t += step ) {
      x = this.world.bezierPoint( 
        this.shape[ i ][ 0 ], 
        this.c1[ i ][ 0 ], 
        this.c2[ i ][ 0 ], 
        this.shape[ i + 1 ][ 0 ], 
        t 
      );
      y = this.world.bezierPoint( 
        this.shape[ i ][ 1 ], 
        this.c1[ i ][ 1 ], 
        this.c2[ i ][ 1 ], 
        this.shape[ i + 1 ][ 1 ], 
        t 
      );
      //Calcular a distancia entre esse ponto e o ultimo
      dist = Math.sqrt( ( ( x - lastX ) * ( x - lastX ) ) + ( ( y - lastY ) * ( y - lastY ) ) );

      this.shapeLength[ i ] += dist;
      this.shapePoints[ i ].s.push( this.shapeLength[ i ] );
      this.shapePoints[ i ].t.push( t );

      lastX = x;
      lastY = y;
    }

    this.shapeTotalLength += this.shapeLength[ i ];
  }

  return this;
};

spine.prototype._findClosestT = function ( shape, s ) {
  var points = this.shapePoints[ shape ];
  var i, l, curr;

  if ( points.s[ 0 ] >= s ) {
    return points.t[ 0 ];
  } 

  for ( i = 0, l = points.s.length; i < l; i++ ) {
    if ( points.s[ i ] > s ) {
      if ( ( points.s[ i ] - s ) > ( s - points.s[ i - 1 ] ) ) {
        curr = points.t[ i - 1 ];
        break;
      } 
      else {
        curr = points.t[ i ];
        break;
      }
    }
  }

  if ( i === l ) {
    return points.t[ i - 1 ];
  }
  else {
    return curr;
  }
};

spine.prototype.generate = function ( steps ) {
  var progress = 0, 
      shapeProgress = 0.001,
      shapeStep = 0,
      step, t, s;

  this.initArrays( steps || this.steps );

  step = this.shapeTotalLength / this.steps;
  
  for( var i = 0; i < this.steps; i++, shapeProgress += step ) {
    if ( ( shapeProgress - progress ) > this.shapeLength[ shapeStep ] ) {
      progress += this.shapeLength[ shapeStep ];
      shapeStep++;
      if ( shapeStep === this.shapeSize ) {
        shapeStep = 0;
      }
    }
      
    s = shapeProgress - progress;
    t = this._findClosestT( shapeStep, s );//lookup this.shapePoints;

    //boom new vert
    this.fromVerts[ i ] = some.vec2.create( 
      this.world.bezierPoint( 
        this.shape[ shapeStep ][ 0 ], 
        this.c1[ shapeStep ][ 0 ], 
        this.c2[ shapeStep ][ 0 ], 
        this.shape[ shapeStep + 1 ][ 0 ],
        t ), 
      this.world.bezierPoint( 
        this.shape[ shapeStep ][ 1 ], 
        this.c1[ shapeStep ][ 1 ], 
        this.c2[ shapeStep ][ 1 ], 
        this.shape[ shapeStep + 1 ][ 1 ], 
        t ) 
    );

    this.toVerts[ i ] = some.vec2.create(
      this.world.bezierTangent( 
        this.shape[ shapeStep ][ 0 ], 
        this.c1[ shapeStep ][ 0 ], 
        this.c2[ shapeStep ][ 0 ], 
        this.shape[ shapeStep + 1 ][ 0 ],
        t ), 
      this.world.bezierTangent( 
        this.shape[ shapeStep ][ 1 ], 
        this.c1[ shapeStep ][ 1 ], 
        this.c2[ shapeStep ][ 1 ], 
        this.shape[ shapeStep + 1 ][ 1 ], 
        t )
    );

    this.originVerts[ i ] = some.vec2.clone( this.fromVerts[ i ] );
    this.originHeadings[ i ] = some.vec2.heading( this.toVerts[ i ] );

    some.vec2.normalize( this.toVerts[ i ], this.toVerts[ i ] );
  }

  return this;
};

some.spine = spine;

module.exports = some;
},{"./some.core":5}],17:[function(require,module,exports){
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
};

vec2.setLen = function ( a, b, out ) {
  vec2.normalize( a, out );
  vec2.scale( out, b, out );
};

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

  out[ 0 ] = Math.sin( heading ) * len;
  out[ 1 ] = Math.cos( heading ) * len;

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
},{"./some.core":5}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAuanMiLCJzcmMvc29tZS5jYW52YXMuanMiLCJzcmMvc29tZS5jbGlwLmpzIiwic3JjL3NvbWUuY29sb3JzcG9vbC5qcyIsInNyYy9zb21lLmNvcmUuanMiLCJzcmMvc29tZS5kcmF3YWJsZS5qcyIsInNyYy9zb21lLmRyYXdhYmxlc3Bvb2wuanMiLCJzcmMvc29tZS5ncmlkLmpzIiwic3JjL3NvbWUuZ3JvdXAuanMiLCJzcmMvc29tZS5pbWFnZS5qcyIsInNyYy9zb21lLml0ZXJhdG9yLmpzIiwic3JjL3NvbWUubGF5b3V0LmpzIiwic3JjL3NvbWUubm9pc2UuanMiLCJzcmMvc29tZS5yYW5kb20uanMiLCJzcmMvc29tZS5zaGFwZS5qcyIsInNyYy9zb21lLnNwaW5lLmpzIiwic3JjL3NvbWUudmVjMi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxud2luZG93LnNvbWUgPSByZXF1aXJlKCAnLi9zcmMvc29tZS5jb3JlJyApO1xyXG5cclxudmFyIERFQlVHID0gKCB0eXBlb2YgREVCVUcgPT09IFwidW5kZWZpbmVkXCIpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuaWYgKCBERUJVRyApIHdpbmRvdy5ERUJVRyA9IHRydWU7XHJcblxyXG5yZXF1aXJlKCAnLi9zcmMvc29tZS5yYW5kb20nICk7XHJcbnJlcXVpcmUoICcuL3NyYy9zb21lLm5vaXNlJyApO1xyXG5yZXF1aXJlKCAnLi9zcmMvc29tZS52ZWMyJyApO1xyXG5cclxucmVxdWlyZSggJy4vc3JjL3NvbWUuaXRlcmF0b3InICk7XHJcblxyXG5yZXF1aXJlKCAnLi9zcmMvc29tZS5kcmF3YWJsZScgKTtcclxucmVxdWlyZSggJy4vc3JjL3NvbWUuaW1hZ2UnICk7XHJcbnJlcXVpcmUoICcuL3NyYy9zb21lLmNhbnZhcycgKTtcclxucmVxdWlyZSggJy4vc3JjL3NvbWUuc2hhcGUnICk7XHJcblxyXG5yZXF1aXJlKCAnLi9zcmMvc29tZS5sYXlvdXQnICk7XHJcbnJlcXVpcmUoICcuL3NyYy9zb21lLmdyaWQnICk7XHJcbnJlcXVpcmUoICcuL3NyYy9zb21lLnNwaW5lJyApO1xyXG5yZXF1aXJlKCAnLi9zcmMvc29tZS5jbGlwJyApO1xyXG5cclxucmVxdWlyZSggJy4vc3JjL3NvbWUuY29sb3JzcG9vbCcgKTtcclxucmVxdWlyZSggJy4vc3JjL3NvbWUuZHJhd2FibGVzcG9vbCcgKTtcclxuXHJcbnJlcXVpcmUoICcuL3NyYy9zb21lLmdyb3VwJyApO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzb21lOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzb21lID0gcmVxdWlyZSggJy4vc29tZS5jb3JlJyApO1xyXG5cclxudmFyIGNhbnZhcyA9IGZ1bmN0aW9uICggd29ybGQsIHdpZHRoLCBoZWlnaHQgKSB7XHJcbiAgc29tZS5kcmF3YWJsZS5jYWxsKCB0aGlzLCB3b3JsZCApO1xyXG5cclxuICB0aGlzLmNhbnZhcyA9IHRoaXMud29ybGQuY3JlYXRlR3JhcGhpY3MoIHdpZHRoIHx8IDE1MCwgaGVpZ2h0IHx8IDE1MCApO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmNhbnZhcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBzb21lLmRyYXdhYmxlLnByb3RvdHlwZSApO1xyXG5cclxuY2FudmFzLnByb3RvdHlwZS5yZXByZXNlbnRhdGlvbiA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdGhpcy53b3JsZC5pbWFnZSggdGhpcy5jYW52YXMsIDAsIDAgKTtcclxufTtcclxuXHJcbnNvbWUuY2FudmFzID0gY2FudmFzO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzb21lOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzb21lID0gcmVxdWlyZSggJy4vc29tZS5jb3JlJyApO1xyXG5cclxudmFyIGNsaXAgPSBmdW5jdGlvbiAoIHdvcmxkLCBjbGlwLCBzdGVwcywgcHJlY2lzaW9uICkge1xyXG4gIHNvbWUubGF5b3V0LmNhbGwoIHRoaXMsIHdvcmxkLCB0cnVlICk7XHJcblxyXG4gIHRoaXMucmFuID0gbmV3IHNvbWUucmFuZG9tKCk7XHJcblxyXG4gIC8vIFRPRE8gaXMgdGhpcyBnb2luZyB0byB3b3JrPyBsb2xcclxuICB0aGlzLmltYWdlID0gdGhpcy53b3JsZC5sb2FkSW1hZ2UoIGNsaXAsIChmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLmdlbmVyYXRlKCBzdGVwcyApO1xyXG4gIH0gKS5iaW5kKCB0aGlzLCBzdGVwcyApICk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuY2xpcC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBzb21lLmxheW91dC5wcm90b3R5cGUgKTtcclxuXHJcbmNsaXAucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCBzdGVwcyApIHtcclxuICB0aGlzLmluaXRBcnJheXMoIHN0ZXBzIHx8IHRoaXMuc3RlcHMgKTtcclxuICBcclxuICB2YXIgeCwgeSwgdyA9IHRoaXMuaW1hZ2Uud2lkdGgsIGggPSB0aGlzLmltYWdlLmhlaWdodCwgZywgY291bnQgPSAwO1xyXG4gIC8vIHJhbmRvbWx5IGNob29zZXMgYSBwb3NpdGlvblxyXG4gIC8vIHRlc3QgdGhhdCBwb3NpdGlvbiAoIHJhbi51bmlmb3JtKCkgPCBhbHBoYSApXHJcbiAgLy8gaWYgdHJ1ZSwgc2F2ZSBwb3NpdGlvblxyXG4gIC8vIGlmIGZhbHNlLCB0cmllcyBhZ2FpbiBhbmQgaS0tXHJcbiAgLy8gdGhpcyBpcyB3cm9uZywgYmVjYXVzZSBpdCBpcyBtaW5pbXVtIG8obikgYW5kIG1heCBvKG5ebilcclxuICB3aGlsZSggY291bnQgIT09IHRoaXMuc3RlcHMgKSB7XHJcbiAgICB4ID0gdGhpcy5yYW4ucmFuZG9tKCB3ICk7XHJcbiAgICB5ID0gdGhpcy5yYW4ucmFuZG9tKCBoICk7XHJcblxyXG4gICAgZyA9IHRoaXMuaW1hZ2UuZ2V0KCB4LCB5ICk7XHJcblxyXG4gICAgaWYoIHRoaXMucmFuLnJhbmRvbSggMjU1ICkgPCBnWyAzIF0gKSB7XHJcbiAgICAgIHRoaXMuZnJvbVZlcnRzWyBjb3VudCBdID0gc29tZS52ZWMyLmNyZWF0ZSggeCwgeSApO1xyXG5cclxuICAgICAgdGhpcy50b1ZlcnRzWyBjb3VudCBdID0gc29tZS52ZWMyLmNyZWF0ZSggMCwgMSApO1xyXG5cclxuICAgICAgdGhpcy5vcmlnaW5WZXJ0c1sgY291bnQgXSA9IHNvbWUudmVjMi5jbG9uZSggdGhpcy5mcm9tVmVydHNbIGNvdW50IF0gKTtcclxuICAgICAgdGhpcy5vcmlnaW5IZWFkaW5nc1sgY291bnQgXSA9IHNvbWUudmVjMi5oZWFkaW5nKCB0aGlzLnRvVmVydHNbIGNvdW50IF0gKTtcclxuICAgICAgY291bnQrKztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuc29tZS5jbGlwID0gY2xpcDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbnZhciBjb2xvcnNQb29sID0gZnVuY3Rpb24gKCB3b3JsZCwgb3B0aW9ucyApIHtcclxuICBzb21lLml0ZXJhdG9yLmNhbGwoIHRoaXMsIHdvcmxkLCB0cnVlICk7XHJcblxyXG4gIHRoaXMuY29sb3JzID0gWyBdO1xyXG5cclxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7IH07XHJcbn07XHJcblxyXG5jb2xvcnNQb29sLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIHNvbWUuaXRlcmF0b3IucHJvdG90eXBlICk7XHJcblxyXG5jb2xvcnNQb29sLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoIGNvbG9yLCBjb3VudCApIHtcclxuICBjb3VudCA9IGNvdW50IHx8IDE7XHJcbiAgLy8gVE9ETyBzb21lLmNvbG9yXHJcbiAgaWYgKCBjb2xvciBpbnN0YW5jZW9mIHA1LkNvbG9yICkge1xyXG4gICAgd2hpbGUgKCBjb3VudCAtLSApIHtcclxuICAgICAgdGhpcy5sZW5ndGgrKztcclxuICAgICAgdGhpcy5jb2xvcnNbIHRoaXMuY29sb3JzLmxlbmd0aCBdID0gY29sb3I7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgd2hpbGUgKCBjb3VudCAtLSApIHtcclxuICAgICAgdGhpcy5sZW5ndGgrKztcclxuICAgICAgdGhpcy5jb2xvcnNbIHRoaXMuY29sb3JzLmxlbmd0aCBdID0gdGhpcy53b3JsZC5jb2xvciggY29sb3IgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuY29sb3JzUG9vbC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKCBpbmRleCApIHtcclxuICB0aGlzLmxlbmd0aC0tO1xyXG4gIGlmICggaW5kZXggPiAtMSApIHtcclxuICAgIHRoaXMuY29sb3JzID0gdGhpcy5jb2xvcnMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5jb2xvcnNQb29sLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdGhpcy5jb2xvcnMgPSBbIF07XHJcblxyXG4gIHRoaXMubGVuZ3RoID0gMDtcclxuICB0aGlzLnJlc2V0KCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuY29sb3JzUG9vbC5wcm90b3R5cGUucmV0cmlldmUgPSBmdW5jdGlvbiAoIGluZGV4ICkge1xyXG4gIHJldHVybiB0aGlzLmNvbG9yc1sgaW5kZXggXTtcclxufTtcclxuXHJcbi8qY29sb3JzUG9vbC5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdGhpcy5uZXh0KCk7XHJcbiAgdGhpcy53b3JsZC5maWxsKCB0aGlzLmdldCgpICk7XHJcbn07XHJcblxyXG5jb2xvcnNQb29sLnByb3RvdHlwZS5zdHJva2UgPSBmdW5jdGlvbiAoICkge1xyXG4gIHRoaXMubmV4dCgpO1xyXG4gIHRoaXMud29ybGQuc3Ryb2tlKCB0aGlzLmdldCgpICk7XHJcbn07XHJcblxyXG5jb2xvcnNQb29sLnByb3RvdHlwZS5maWxsQW5kU3Ryb2tlID0gZnVuY3Rpb24gKCApIHtcclxuICB0aGlzLmZpbGwoKTtcclxuICB0aGlzLnN0cm9rZSgpO1xyXG59OyovXHJcblxyXG5zb21lLmNvbG9yc1Bvb2wgPSBjb2xvcnNQb29sO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzb21lOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzb21lID0gZnVuY3Rpb24gKCApIHsgfTtcclxuXHJcbnNvbWUuQXJyYXkgPSAoIHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnICkgPyBGbG9hdDMyQXJyYXkgOiBBcnJheTtcclxuXHJcbi8vIENvbnZlcnNpb24gTXVsdGlwbGljYXRpb25zXHJcbnNvbWUudG9SYWRpYW5zID0gTWF0aC5QSSAvIDE4MDtcclxuc29tZS50b0RlZ3JlZXMgPSAxIC8gc29tZS50b1JhZGlhbnM7XHJcblxyXG4vLyBDT05TVEFOVFMgXHJcbi8vIGdyaWRzXHJcbnNvbWUuR1JJRCA9IDE7XHJcbnNvbWUuU1BJTkUgPSAyO1xyXG5cclxuLy8gcmFuZG9tICYgbm9pc2Vcclxuc29tZS5PUkRFUiA9IDM7XHJcbnNvbWUuTk9JU0UgPSA0O1xyXG5zb21lLlJBTkRPTSA9IDU7XHJcbnNvbWUuTk9STUFMID0gNjtcclxuc29tZS5FWFBPTkVOVElBTCA9IDc7XHJcbnNvbWUuUE9JU1NPTiA9IDg7XHJcbnNvbWUuR0FNTUEgPSA5O1xyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbnZhciBkcmF3YWJsZSA9IGZ1bmN0aW9uICggd29ybGQgKSB7XHJcbiAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG5cclxuICB0aGlzLnBvc2l0aW9uID0gc29tZS52ZWMyLmNyZWF0ZSgpO1xyXG5cclxuICB0aGlzLnNpemVPcmlnaW5hbCA9IHNvbWUudmVjMi5jcmVhdGUoKTtcclxuICB0aGlzLnNpemVWYWx1ZSA9IHRoaXMuc2l6ZU9yaWdpbmFsO1xyXG4gIHRoaXMuc2l6ZUNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICB0aGlzLmF4aXNPcmlnaW5hbCA9IHNvbWUudmVjMi5jcmVhdGUoIDAsIDEgKTtcclxuICB0aGlzLmF4aXNWYWx1ZSA9IHNvbWUudmVjMi5jcmVhdGUoIDAsIDEgKTtcclxuXHJcbiAgdGhpcy5hbmNob3JWYWx1ZSA9IHNvbWUudmVjMi5jcmVhdGUoIDAsIDAgKTtcclxuXHJcbiAgdGhpcy50ZW1wUG9zID0gc29tZS52ZWMyLmNyZWF0ZSgpO1xyXG4gIHRoaXMudGVtcEF4aXMgPSBzb21lLnZlYzIuY3JlYXRlKCk7XHJcbn07XHJcblxyXG5kcmF3YWJsZS5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoIHgsIHkgKSB7XHJcbiAgc29tZS52ZWMyLnNldCggeCwgeSwgdGhpcy5wb3NpdGlvbiApO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZHJhd2FibGUucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbiAoIHgsIHkgKSB7XHJcbiAgaWYoICEgdGhpcy5zaXplQ2hhbmdlICkge1xyXG4gICAgdGhpcy5zaXplVmFsdWUgPSBzb21lLnZlYzIuY2xvbmUodGhpcy5zaXplT3JpZ2luYWwpO1xyXG4gICAgdGhpcy5zaXplQ2hhbmdlID0gdHJ1ZTtcclxuICB9XHJcbiAgc29tZS52ZWMyLnNldCggeCwgeSwgdGhpcy5zaXplVmFsdWUgKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmRyYXdhYmxlLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCB4LCB5ICkge1xyXG4gIGlmKCAhIHRoaXMuc2l6ZUNoYW5nZSApIHtcclxuICAgIHRoaXMuc2l6ZVZhbHVlID0gc29tZS52ZWMyLmNsb25lKHRoaXMuc2l6ZU9yaWdpbmFsKTtcclxuICAgIHRoaXMuc2l6ZUNoYW5nZSA9IHRydWU7XHJcbiAgfVxyXG4gIHNvbWUudmVjMi5hZGQoIHRoaXMuc2l6ZVZhbHVlLCBbIHgsIHkgXSwgdGhpcy5zaXplVmFsdWUgKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmRyYXdhYmxlLnByb3RvdHlwZS5zY2FsZSA9IGZ1bmN0aW9uICggc2NhbGUgKSB7XHJcbiAgc29tZS52ZWMyLm11bHQoIHRoaXMuc2l6ZVZhbHVlLCBzY2FsZSwgdGhpcy5zaXplVmFsdWUgKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmRyYXdhYmxlLnByb3RvdHlwZS5zZXRBbmNob3IgPSBmdW5jdGlvbiAoIHgsIHkgKSB7XHJcbiAgc29tZS52ZWMyLnNldCggeCwgeSwgdGhpcy5hbmNob3JWYWx1ZSApO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZHJhd2FibGUucHJvdG90eXBlLmFuY2hvciA9IGZ1bmN0aW9uKCB4LCB5ICkge1xyXG4gIHNvbWUudmVjMi5hZGQoIHRoaXMuYW5jaG9yVmFsdWUsIFsgeCAsIHkgXSwgdGhpcy5hbmNob3JWYWx1ZSApO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZHJhd2FibGUucHJvdG90eXBlLnNldEF4aXMgPSBmdW5jdGlvbiAoIHgsIHkgKSB7XHJcbiAgc29tZS52ZWMyLnNldCggeCwgeSwgdGhpcy5heGlzVmFsdWUgKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmRyYXdhYmxlLnByb3RvdHlwZS5heGlzID0gZnVuY3Rpb24gKCB4LCB5ICkge1xyXG4gIHNvbWUudmVjMi5hZGQoIHRoaXMuYXhpc1ZhbHVlLCBbIHggLCB5IF0sIHRoaXMuYXhpc1ZhbHVlICk7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07IFxyXG5cclxuZHJhd2FibGUucHJvdG90eXBlLnNldFJvdGF0aW9uID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcclxuICBhbmdsZSA9IGFuZ2xlICogc29tZS50b1JhZGlhbnM7XHJcbiAgc29tZS52ZWMyLmNvcHkoIHRoaXMuYXhpc09yaWdpbmFsLCB0aGlzLmF4aXNWYWx1ZSApO1xyXG4gIHNvbWUudmVjMi5yb3RhdGUoIHRoaXMuYXhpc1ZhbHVlLCAtYW5nbGUsIHRoaXMuYXhpc1ZhbHVlICk7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5kcmF3YWJsZS5wcm90b3R5cGUucm90YXRlID0gZnVuY3Rpb24gKCBhbmdsZSApIHtcclxuICBhbmdsZSA9IGFuZ2xlICogc29tZS50b1JhZGlhbnM7XHJcbiAgc29tZS52ZWMyLnJvdGF0ZSggdGhpcy5heGlzVmFsdWUsIC1hbmdsZSwgdGhpcy5heGlzVmFsdWUgKTtcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmRyYXdhYmxlLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24gKCBmcm9tLCBheGlzLCBheGlzWCwgYXhpc1kgKSB7XHJcbiAgaWYgKCB0eXBlb2YgYXhpc1ggIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGF4aXNZICE9PSBcInVuZGVmaW5lZFwiICkge1xyXG4gICAgLy8gZnJvbVgsIGZyb21ZXHJcbiAgICBzb21lLnZlYzIuc2V0KCBmcm9tLCBheGlzLCB0aGlzLnRlbXBQb3MgKTtcclxuICAgIHNvbWUudmVjMi5zZXQoIGF4aXNYLCBheGlzWSwgdGhpcy50ZW1wQXhpcyApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHNvbWUudmVjMi5jb3B5KCBmcm9tIHx8IHRoaXMucG9zaXRpb24sIHRoaXMudGVtcFBvcyApO1xyXG4gICAgc29tZS52ZWMyLmNvcHkoIGF4aXMgfHwgWyAwLDAgXSwgdGhpcy50ZW1wQXhpcyApO1xyXG4gIH1cclxuXHJcbiAgdmFyIG1hZ25pdHVkZSA9IHNvbWUudmVjMi5sZW4oIHRoaXMuc2l6ZVZhbHVlICkgLyBzb21lLnZlYzIubGVuKCB0aGlzLnNpemVPcmlnaW5hbCApO1xyXG5cclxuICAvLyBDZW50ZXIgYW5jaG9yXHJcbiAgLy8gdGhpcy50ZW1wUG9zLmFkZCggdGhpcy5hbmNob3JWYWx1ZSApOyBcclxuXHJcbiAgdGhpcy53b3JsZC5wdXNoKCk7XHJcbiAgICB0aGlzLndvcmxkLnRyYW5zbGF0ZSggdGhpcy50ZW1wUG9zWyAwIF0sIHRoaXMudGVtcFBvc1sgMSBdICk7XHJcbiAgICB0aGlzLndvcmxkLnJvdGF0ZSggc29tZS52ZWMyLmhlYWRpbmcoIHRoaXMuYXhpc09yaWdpbmFsICkgLSBzb21lLnZlYzIuaGVhZGluZyggdGhpcy50ZW1wQXhpcyApIC0gc29tZS52ZWMyLmhlYWRpbmcoIHRoaXMuYXhpc1ZhbHVlICkgKTtcclxuICAgIHRoaXMud29ybGQuc2NhbGUoIHRoaXMuc2l6ZVZhbHVlWyAwIF0gLyB0aGlzLnNpemVPcmlnaW5hbFsgMCBdLCB0aGlzLnNpemVWYWx1ZVsgMSBdIC8gdGhpcy5zaXplT3JpZ2luYWxbIDEgXSApOyBcclxuICAgIHRoaXMud29ybGQudHJhbnNsYXRlKCAtdGhpcy5hbmNob3JWYWx1ZVsgMCBdLCAtdGhpcy5hbmNob3JWYWx1ZVsgMSBdICk7XHJcbiAgICB0aGlzLndvcmxkLnN0cm9rZVdlaWdodCggMSAvIG1hZ25pdHVkZSApO1xyXG5cclxuICAgIHRoaXMucmVwcmVzZW50YXRpb24oKTtcclxuICBcclxuICAgIGlmICggREVCVUcgKSB7XHJcbiAgICAgIHRoaXMud29ybGQudHJhbnNsYXRlKCB0aGlzLmFuY2hvclZhbHVlWyAwIF0sIHRoaXMuYW5jaG9yVmFsdWVbIDEgXSApO1xyXG4gICAgICB0aGlzLndvcmxkLnJvdGF0ZSggLXNvbWUudmVjMi5oZWFkaW5nKCB0aGlzLnRlbXBBeGlzICkgKTtcclxuICAgICAgXHJcbiAgICAgIC8vcGluayBzaXplXHJcbiAgICAgIHRoaXMud29ybGQuc3Ryb2tlKCAyNTUsIDEwMCwgMjUwICk7XHJcbiAgICAgIHRoaXMud29ybGQuc3Ryb2tlV2VpZ2h0KCAyICk7XHJcbiAgICAgIHRoaXMud29ybGQubGluZSggMCwwICwgdGhpcy5zaXplVmFsdWVbIDAgXSx0aGlzLnNpemVWYWx1ZVsgMSBdICk7XHJcbiAgICAgIFxyXG4gICAgICB0aGlzLndvcmxkLm5vU3Ryb2tlKCk7XHJcbiAgICAgIFxyXG4gICAgICAvL3JlZCBvcmlnaW5cclxuICAgICAgdGhpcy53b3JsZC5maWxsKCAwLCAxMDAsIDgwICk7XHJcbiAgICAgIHRoaXMud29ybGQucmVjdCggLTQsLTQsIDgsOCApO1xyXG5cclxuICAgICAgLy8gZ3JlZW4gc2l6ZVxyXG4gICAgICB0aGlzLndvcmxkLmZpbGwoIDE1MCwgMTUwLCAxMDAgKTtcclxuICAgICAgdGhpcy53b3JsZC5yZWN0KCB0aGlzLnNpemVWYWx1ZVsgMCBdIC0gNCwgdGhpcy5zaXplVmFsdWVbIDEgXSAtIDQsIDgsOCApO1xyXG5cclxuICAgICAgLy9ibHVlIGFuY2hvclxyXG4gICAgICB0aGlzLndvcmxkLmZpbGwoIDIwMCwgMTUwLCAxMDAgKTsgXHJcbiAgICAgIHRoaXMud29ybGQucmVjdCggdGhpcy5hbmNob3JWYWx1ZVsgMCBdIC0gNCwgdGhpcy5hbmNob3JWYWx1ZVsgMSBdIC0gNCwgOCw4ICk7XHJcbiAgICAgIHRoaXMud29ybGQucm90YXRlKCAtIHNvbWUudmVjMi5oZWFkaW5nKCB0aGlzLnRlbXBBeGlzICkgKTtcclxuXHJcbiAgICAgIC8vIGF4aXNcclxuICAgICAgdGhpcy53b3JsZC5zdHJva2UoIFwiIzAwMDAwMFwiICk7XHJcbiAgICAgIHRoaXMud29ybGQubGluZSggMCwwLCB0aGlzLnRlbXBBeGlzWyAwIF0sIHRoaXMudGVtcEF4aXNbIDEgXSApO1xyXG4gICAgfVxyXG4gIHRoaXMud29ybGQucG9wKCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZHJhd2FibGUucHJvdG90eXBlLnJlcHJlc2VudGF0aW9uID0gZnVuY3Rpb24gKCkge1xyXG5cclxufTtcclxuXHJcbnNvbWUuZHJhd2FibGUgPSBkcmF3YWJsZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbnZhciBkcmF3YWJsZXNQb29sID0gZnVuY3Rpb24gKCB3b3JsZCwgb3B0aW9ucyApIHtcclxuICBzb21lLml0ZXJhdG9yLmNhbGwoIHRoaXMsIHdvcmxkLCB0cnVlICk7XHJcblxyXG4gIHRoaXMuZHJhd2FibGVzID0gWyBdO1xyXG4gIHRoaXMuZHJhd2FibGVzRnVuY3Rpb25zID0gWyBdO1xyXG5cclxuICB0aGlzLmRyYXdGdW5jdGlvbiA9IGZhbHNlO1xyXG5cclxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7IH07XHJcblxyXG4gIGlmICggb3B0aW9ucy5kcmF3ICkgeyBcclxuICAgIC8vIFVuaXF1ZSBkcmF3IGZ1bmN0aW9uXHJcbiAgICB0aGlzLmRyYXdGdW5jdGlvbiA9IG9wdGlvbnMuZHJhdztcclxuICB9XHJcbn07XHJcblxyXG5kcmF3YWJsZXNQb29sLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIHNvbWUuaXRlcmF0b3IucHJvdG90eXBlICk7XHJcblxyXG5kcmF3YWJsZXNQb29sLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoIGRyYXdhYmxlLCBjb3VudCwgZHJhd2FibGVGdW5jdGlvbiApIHtcclxuICBjb3VudCA9IGNvdW50IHx8IDE7XHJcblxyXG4gIC8vIFRPRE8gTW92ZSB0aGlzIHRvIGl0ZXJhdG9yICggZHJhd2FibGVzUG9vbC5wcm90b3R5cGUuaW5zZXJ0ICYgaXRlcmF0b3IucHJvdG90eXBlLmFkZCApXHJcbiAgdGhpcy5sZW5ndGggKz0gY291bnQ7XHJcbiAgXHJcbiAgaWYgKCBkcmF3YWJsZSBpbnN0YW5jZW9mIHNvbWUuZHJhd2FibGUgKSB7XHJcbiAgICB3aGlsZSAoIGNvdW50IC0tICkge1xyXG4gICAgICB0aGlzLmRyYXdhYmxlc1sgdGhpcy5kcmF3YWJsZXMubGVuZ3RoIF0gPSBkcmF3YWJsZTtcclxuICAgICAgdGhpcy5kcmF3YWJsZXNGdW5jdGlvbnNbIHRoaXMuZHJhd2FibGVzRnVuY3Rpb25zLmxlbmd0aCBdID0gZHJhd2FibGVGdW5jdGlvbiB8fCBmdW5jdGlvbiAoICkgeyB9O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5kcmF3YWJsZXNQb29sLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoIGluZGV4ICkge1xyXG4gIC8vIFRPRE8gU2FtZSBhcyBhZGRcclxuICB0aGlzLmxlbmd0aC0tO1xyXG5cclxuICBpZiAoIGluZGV4ID4gLTEgKSB7XHJcbiAgICB0aGlzLmRyYXdhYmxlcyA9IHRoaXMuZHJhd2FibGVzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgIHRoaXMuZHJhd2FibGVzRnVuY3Rpb25zID0gdGhpcy5kcmF3YWJsZXNGdW5jdGlvbnMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5kcmF3YWJsZXNQb29sLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdGhpcy5kcmF3YWJsZXMgPSBbIF07XHJcbiAgdGhpcy5kcmF3YWJsZXNGdW5jdGlvbnMgPSBbIF07XHJcblxyXG4gIHRoaXMubGVuZ3RoID0gMDtcclxuICB0aGlzLnJlc2V0KCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZHJhd2FibGVzUG9vbC5wcm90b3R5cGUucmV0cmlldmUgPSBmdW5jdGlvbiAoIGluZGV4ICkgeyBcclxuICByZXR1cm4ge1xyXG4gICAgZHJhd2FibGU6IHRoaXMuZHJhd2FibGVzWyBpbmRleCBdLFxyXG4gICAgZm46ICggdGhpcy5kcmF3RnVuY3Rpb24gKSA/IHRoaXMuZHJhd0Z1bmN0aW9uIDogdGhpcy5kcmF3YWJsZXNGdW5jdGlvbnNbIGluZGV4IF1cclxuICB9O1xyXG59O1xyXG5cclxuc29tZS5kcmF3YWJsZXNQb29sID0gZHJhd2FibGVzUG9vbDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbnZhciBncmlkID0gZnVuY3Rpb24gKCB3b3JsZCwgd2lkdGgsIGhlaWdodCwgbWFyZ2luWCwgbWFyZ2luWSApIHtcclxuICBzb21lLmxheW91dC5jYWxsKCB0aGlzLCB3b3JsZCwgdHJ1ZSApO1xyXG5cclxuICB0aGlzLmhvcml6b250YWwgPSBtYXJnaW5YIHx8IDE7XHJcbiAgdGhpcy52ZXJ0aWNhbCA9IG1hcmdpblkgfHwgbWFyZ2luWCB8fCAxO1xyXG5cclxuICB0aGlzLnNldFNpemUoIHdpZHRoLCBoZWlnaHQgKTtcclxuICB0aGlzLmdlbmVyYXRlKCk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZ3JpZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBzb21lLmxheW91dC5wcm90b3R5cGUgKTtcclxuXHJcbmdyaWQucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbiAoIHcsIGggKSB7XHJcbiAgdyA9IHcgfHwgMTtcclxuICBoID0gaCB8fCB3O1xyXG4gIHRoaXMuc3RlcHMgPSB3ICogaDtcclxuICB0aGlzLndpZHRoID0gdztcclxufTtcclxuXHJcbmdyaWQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCBzdGVwcyApIHtcclxuICB2YXIgdCwgcztcclxuXHJcbiAgdGhpcy5pbml0QXJyYXlzKCBzdGVwcyB8fCB0aGlzLnN0ZXBzICk7XHJcblxyXG4gIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5zdGVwczsgaSsrICkge1xyXG4gICAgLy9ib29tIG5ldyB2ZXJ0XHJcbiAgICB0aGlzLmZyb21WZXJ0c1sgaSBdID0gc29tZS52ZWMyLmNyZWF0ZShcclxuICAgICAgdGhpcy5ob3Jpem9udGFsICogKCBpICUgdGhpcy53aWR0aCApICwgXHJcbiAgICAgIHRoaXMudmVydGljYWwgKiBNYXRoLmZsb29yKCBpIC8gdGhpcy53aWR0aClcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy50b1ZlcnRzWyBpIF0gPSBzb21lLnZlYzIuY3JlYXRlKCAwLCAxICk7XHJcblxyXG4gICAgdGhpcy5vcmlnaW5WZXJ0c1sgaSBdID0gc29tZS52ZWMyLmNsb25lKCB0aGlzLmZyb21WZXJ0c1sgaSBdICk7XHJcbiAgICB0aGlzLm9yaWdpbkhlYWRpbmdzWyBpIF0gPSBzb21lLnZlYzIuaGVhZGluZyggdGhpcy50b1ZlcnRzWyBpIF0gKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZ3JpZC5wcm90b3R5cGUuc2V0TWFyZ2luID0gZnVuY3Rpb24gKCBob3Jpem9udGFsLCB2ZXJ0aWNhbCApIHtcclxuICB0aGlzLmhvcml6b250YWwgPSBob3Jpem9udGFsIHx8IHRoaXMuaG9yaXpvbnRhbDtcclxuICB0aGlzLnZlcnRpY2FsID0gdmVydGljYWwgfHwgaG9yaXpvbnRhbCB8fCB0aGlzLnZlcnRpY2FsO1xyXG5cclxuICB0aGlzLmdlbmVyYXRlKCApO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbnNvbWUuZ3JpZCA9IGdyaWQ7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNvbWU7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIHNvbWUgPSByZXF1aXJlKCAnLi9zb21lLmNvcmUnICk7XHJcblxyXG52YXIgZ3JvdXAgPSBmdW5jdGlvbiAoIHdvcmxkLCBvcHRpb25zICkge1xyXG4gIHNvbWUuZHJhd2FibGUuY2FsbCggdGhpcywgd29ybGQgKTtcclxuXHJcbiAgdGhpcy5sYXlvdXQgPSB7XHJcbiAgICBuZXh0OiBmdW5jdGlvbiAoKSB7IH1cclxuICB9O1xyXG5cclxuICB0aGlzLmNvbG9yc1Bvb2wgPSB7XHJcbiAgICBuZXh0OiBmdW5jdGlvbiAoKSB7IH1cclxuICB9O1xyXG5cclxuICB0aGlzLmRyYXdhYmxlc1Bvb2wgPSB7fTtcclxuXHJcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgeyB9O1xyXG5cclxuICBpZiAoIHR5cGVvZiBvcHRpb25zLmxheW91dCAhPT0gXCJ1bmRlZmluZWRcIiApIHtcclxuICAgIHRoaXMubGF5b3V0ID0gb3B0aW9ucy5sYXlvdXQ7XHJcbiAgfVxyXG4gIFxyXG4gIGlmICggdHlwZW9mIG9wdGlvbnMuY29sb3JzUG9vbCAhPT0gXCJ1bmRlZmluZWRcIiB8fFxyXG4gICAgICAgdHlwZW9mIG9wdGlvbnMuY29sb3JzcG9vbCAhPT0gXCJ1bmRlZmluZWRcIiB8fFxyXG4gICAgICAgdHlwZW9mIG9wdGlvbnMuY29sb3JzICE9PSBcInVuZGVmaW5lZFwiXHJcbiAgICApIHtcclxuICAgIHRoaXMuY29sb3JzUG9vbCA9IG9wdGlvbnMuY29sb3JzUG9vbCB8fCBvcHRpb25zLmNvbG9yc3Bvb2wgfHwgb3B0aW9ucy5jb2xvcnM7XHJcbiAgfVxyXG5cclxuICBpZiAoIHR5cGVvZiBvcHRpb25zLmRyYXdhYmxlc1Bvb2wgIT09IFwidW5kZWZpbmVkXCIgfHxcclxuICAgICAgIHR5cGVvZiBvcHRpb25zLmRyYXdhYmxlc3Bvb2wgIT09IFwidW5kZWZpbmVkXCIgfHxcclxuICAgICAgIHR5cGVvZiBvcHRpb25zLmRyYXdhYmxlcyAhPT0gXCJ1bmRlZmluZWRcIlxyXG4gICAgKSB7XHJcbiAgICB0aGlzLmRyYXdhYmxlc1Bvb2wgPSBvcHRpb25zLmRyYXdhYmxlc1Bvb2wgfHwgb3B0aW9ucy5kcmF3YWJsZXNwb29sIHx8IG9wdGlvbnMuZHJhd2FibGVzO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7IFxyXG59O1xyXG5cclxuZ3JvdXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggc29tZS5kcmF3YWJsZS5wcm90b3R5cGUgKTtcclxuXHJcbmdyb3VwLnByb3RvdHlwZS5zZXREcmF3YWJsZXNQb29sID0gZnVuY3Rpb24gKCBkcmF3YWJsZXNQb29sICkge1xyXG4gIHRoaXMuZHJhd2FibGVzUG9vbCA9IGRyYXdhYmxlc1Bvb2w7XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5ncm91cC5wcm90b3R5cGUuc2V0Q29sb3JzUG9vbCA9IGZ1bmN0aW9uICggY29sb3JzUG9vbCApIHtcclxuICB0aGlzLmNvbG9yc1Bvb2wgPSBjb2xvcnNQb29sO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZ3JvdXAucHJvdG90eXBlLnNldExheW91dCA9IGZ1bmN0aW9uICggbGF5b3V0ICkge1xyXG4gIHRoaXMubGF5b3V0ID0gbGF5b3V0O1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuZ3JvdXAucHJvdG90eXBlLnJlcHJlc2VudGF0aW9uID0gZnVuY3Rpb24gKCApIHtcclxuICB2YXIgbiwgYywgcDtcclxuICB0aGlzLmxheW91dC5yZXNldCgpO1xyXG4gIC8vdGhpcy5jb2xvcnNQb29sLnJlc2V0KCk7XHJcbiAgd2hpbGUgKCB0aGlzLmxheW91dC5uZXh0KCkgKSB7XHJcbiAgICBuID0gdGhpcy5sYXlvdXQuZ2V0KCk7XHJcbiAgICBwID0gdGhpcy5kcmF3YWJsZXNQb29sLmdldCgpO1xyXG4gICAgXHJcbiAgICBwLmRyYXdhYmxlLnNldFBvc2l0aW9uKCBuLmZyb21bIDAgXSwgbi5mcm9tWyAxIF0gKTtcclxuICAgIHAuZHJhd2FibGUuYXhpcyggbi50b1sgMCBdLCBuLnRvWyAxIF0gKTtcclxuXHJcbiAgICB0aGlzLndvcmxkLmZpbGwoIHRoaXMuY29sb3JzUG9vbC5nZXQoKSApO1xyXG4gICAgdGhpcy53b3JsZC5zdHJva2UoIHRoaXMuY29sb3JzUG9vbC5nZXQoKSApO1xyXG5cclxuICAgIGlmICggISBwLmZuKCB0aGlzLndvcmxkLCBwLmRyYXdhYmxlICkgKSB7XHJcbiAgICAgIHAuZHJhd2FibGUuZHJhdygpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbnNvbWUuZ3JvdXAgPSBncm91cDtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbnZhciBpbWFnZSA9IGZ1bmN0aW9uICggd29ybGQsIGltZ1BhdGggKSB7XHJcbiAgc29tZS5kcmF3YWJsZS5jYWxsKCB0aGlzLCB3b3JsZCApO1xyXG5cclxuICB0aGlzLmltYWdlID0gdGhpcy53b3JsZC5sb2FkSW1hZ2UoIGltZ1BhdGggKTtcclxuICBcclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbmltYWdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIHNvbWUuZHJhd2FibGUucHJvdG90eXBlICk7XHJcblxyXG5pbWFnZS5wcm90b3R5cGUucmVwcmVzZW50YXRpb24gPSBmdW5jdGlvbiAoICkge1xyXG4gIHRoaXMud29ybGQuaW1hZ2UoIHRoaXMuaW1hZ2UsIDAsMCApO1xyXG59O1xyXG5cclxuc29tZS5pbWFnZSA9IGltYWdlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzb21lOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzb21lID0gcmVxdWlyZSggJy4vc29tZS5jb3JlJyApO1xyXG5cclxudmFyIGl0ZXJhdG9yID0gZnVuY3Rpb24gKCB3b3JsZCwgbG9vcGFibGUgKSB7XHJcbiAgdGhpcy53b3JsZCA9IHdvcmxkO1xyXG4gIHRoaXMubGVuZ3RoID0gMDtcclxuICB0aGlzLmluZGV4ID0gLTE7XHJcbiAgdGhpcy5jb3VudCA9IDA7XHJcbiAgdGhpcy5sb29wYWJsZSA9IGxvb3BhYmxlIHx8IGZhbHNlO1xyXG5cclxuICB0aGlzLnNlbGVjdG9yID0gc29tZS5PUkRFUjsgLy9vcmRlbmVkISFcclxufTtcclxuXHJcbml0ZXJhdG9yLnByb3RvdHlwZS5zZXRTZWxlY3RvciA9IGZ1bmN0aW9uICggc2VsZWN0b3IsIHNlZWQgKSB7XHJcbiAgaWYgKCBzZWxlY3RvciA9PT0gc29tZS5OT0lTRSApIHtcclxuICAgIHRoaXMuc2VsZWN0b3JJbnN0YW5jZSA9IG5ldyBzb21lLm5vaXNlKCBzZWVkICk7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBzZWxlY3RvciAhPT0gc29tZS5PUkRFUiApIHtcclxuICAgIHRoaXMuc2VsZWN0b3JJbnN0YW5jZSA9IG5ldyBzb21lLnJhbmRvbSggc2VlZCApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIC8vIE9SREVSIGhhcyBubyBpbnN0YW5jZVxyXG4gICAgdGhpcy5zZWxlY3Rvckluc3RhbmNlID0gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbml0ZXJhdG9yLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdmFyIHZhbHVlO1xyXG4gIHN3aXRjaCAoIHRoaXMuc2VsZWN0b3IgKSB7XHJcbiAgICBjYXNlIHNvbWUuT1JERVI6XHJcbiAgICAgIHZhbHVlID0gdGhpcy5pbmRleDtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIHNvbWUuUkFORE9NOlxyXG4gICAgICB2YWx1ZSA9IHRoaXMuc2VsZWN0b3JJbnN0YW5jZS5yYW5kb20oIHRoaXMubGVuZ3RoICk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBzb21lLk5PUk1BTDpcclxuICAgICAgdmFsdWUgPSB0aGlzLmxlbmd0aCAqIHRoaXMuc2VsZWN0b3JJbnN0YW5jZS5ub3JtYWwoICk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBzb21lLkVYUE9ORU5USUFMOlxyXG4gICAgICB2YWx1ZSA9IHRoaXMubGVuZ3RoICogdGhpcy5zZWxlY3Rvckluc3RhbmNlLmV4cG9uZW50aWFsKCApO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2Ugc29tZS5QT0lTU09OOlxyXG4gICAgICB2YWx1ZSA9IHRoaXMubGVuZ3RoICogdGhpcy5zZWxlY3Rvckluc3RhbmNlLnBvaXNzb24oICk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBzb21lLkdBTU1BOlxyXG4gICAgICB2YWx1ZSA9IHRoaXMubGVuZ3RoICogdGhpcy5zZWxlY3Rvckluc3RhbmNlLmdhbW1hKCAwLjk5ICk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBzb21lLk5PSVNFOlxyXG4gICAgICB2YWx1ZSA9IHRoaXMubGVuZ3RoICogdGhpcy5zZWxlY3Rvckluc3RhbmNlLmdldCggdGhpcy5jb3VudCwgMSApO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHJldHVybiBNYXRoLmZsb29yKCB2YWx1ZSApO1xyXG59O1xyXG5cclxuaXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoICkge1xyXG4gIGlmICggdGhpcy5pbmRleCArIDEgPCB0aGlzLmxlbmd0aCApIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG4vLyBnZXQgXHJcbi8vIC0+IGFkZCBvbmUgdG8gaW5kZXhcclxuLy8gLT4gZ2V0IG9uZSB2YWx1ZSBiZXR3ZWVuIHplcm8gYW5kIGxlbmd0aFxyXG4vLyAtPiByZXR1cm4gaXRlcmFibGUgXHJcbml0ZXJhdG9yLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoICkge1xyXG4gIGlmICggdGhpcy5uZXh0KCApIHx8IHRoaXMubG9vcGFibGUgKSB7XHJcbiAgICB0aGlzLmluZGV4ID0gKCAoIHRoaXMuaW5kZXggKyAxIDwgdGhpcy5sZW5ndGggKSB8fCAhdGhpcy5sb29wYWJsZSApID8gdGhpcy5pbmRleCArIDEgOiAwO1xyXG4gICAgdGhpcy5jb3VudCsrO1xyXG4gICAgcmV0dXJuIHRoaXMucmV0cmlldmUoIHRoaXMuZ2V0VmFsdWUoICkgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbml0ZXJhdG9yLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdGhpcy5pbmRleCA9IC0xO1xyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuc29tZS5pdGVyYXRvciA9IGl0ZXJhdG9yO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzb21lOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzb21lID0gcmVxdWlyZSggJy4vc29tZS5jb3JlJyApO1xyXG5cclxudmFyIGxheW91dCA9IGZ1bmN0aW9uICggd29ybGQsIHJpZ2lkICkge1xyXG4gIHNvbWUuaXRlcmF0b3IuY2FsbCggdGhpcywgd29ybGQgKTtcclxuXHJcbiAgdGhpcy5pbml0QXJyYXlzID0gcmlnaWQgPyB0aGlzLmluaXRBcnJheXNGbGV4aWJsZSA6IHRoaXMuaW5pdEFycmF5c1N0YXRpYztcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5sYXlvdXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggc29tZS5pdGVyYXRvci5wcm90b3R5cGUgKTtcclxuXHJcbi8vIFRPRE8gdGhpcyBpcyBub3QgdXNpbmcgSXRlcmFhYXRvcnMgOlggaXMgaXQ/XHJcbmxheW91dC5wcm90b3R5cGUuaW5pdEFycmF5c1N0YXRpYyA9IGZ1bmN0aW9uICggc3RlcHMgKSB7XHJcbiAgLy9pdGVyYXRvclxyXG4gIHRoaXMubGVuZ3RoID0gc3RlcHM7XHJcblxyXG4gIHRoaXMuc3RlcHMgPSBzdGVwcztcclxuXHJcbiAgdGhpcy5mcm9tVmVydHMgPSBuZXcgc29tZS5BcnJheSggc3RlcHMgKTtcclxuICB0aGlzLnRvVmVydHMgPSBuZXcgc29tZS5BcnJheSggc3RlcHMgKTtcclxuXHJcbiAgdGhpcy5vcmlnaW5WZXJ0cyA9IG5ldyBzb21lLkFycmF5KCBzdGVwcyApO1xyXG4gIHRoaXMub3JpZ2luSGVhZGluZ3MgPSBuZXcgc29tZS5BcnJheSggc3RlcHMgKTtcclxufTtcclxuXHJcbmxheW91dC5wcm90b3R5cGUuaW5pdEFycmF5c0ZsZXhpYmxlID0gZnVuY3Rpb24gKCBzdGVwcyApIHtcclxuICAvL2l0ZXJhdG9yXHJcbiAgdGhpcy5sZW5ndGggPSBzdGVwcztcclxuXHJcbiAgdGhpcy5zdGVwcyA9IHN0ZXBzO1xyXG5cclxuICB0aGlzLmZyb21WZXJ0cyA9IFsgXTtcclxuICB0aGlzLnRvVmVydHMgPSBbIF07XHJcblxyXG4gIHRoaXMub3JpZ2luVmVydHMgPSBbIF07XHJcbiAgdGhpcy5vcmlnaW5IZWFkaW5ncyA9IFsgXTtcclxufTtcclxuXHJcbmxheW91dC5wcm90b3R5cGUucm90YXRlVmVydHMgPSBmdW5jdGlvbiAoIGFuZ2xlICkge1xyXG4gIGFuZ2xlID0gYW5nbGUgKiBzb21lLnRvUmFkaWFucztcclxuICBmb3IgKCB2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcclxuICAgIHNvbWUudmVjMi5yb3RhdGUoIHRoaXMudG9WZXJ0c1sgaSBdLCB0aGlzLm9yaWdpbkhlYWRpbmdzWyBpIF0gKyBhbmdsZSAtIHNvbWUudmVjMi5oZWFkaW5nKCB0aGlzLnRvVmVydHNbIGkgXSApLCB0aGlzLnRvVmVydHNbIGkgXSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5sYXlvdXQucHJvdG90eXBlLm1vdmVWZXJ0cyA9IGZ1bmN0aW9uICggbW92ZW1lbnQgKSB7XHJcbiAgdmFyIGFuZ2xlO1xyXG4gIGZvciAoIHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xyXG4gICAgYW5nbGUgPSBzb21lLnZlYzIuaGVhZGluZyggdGhpcy50b1ZlcnRzWyBpIF0gKSAtIE1hdGguYWJzKCBzb21lLnZlYzIuaGVhZGluZyggbW92ZW1lbnQgKSApO1xyXG4gICAgc29tZS52ZWMyLnJvdGF0ZSggbW92ZW1lbnQsIGFuZ2xlLCBtb3ZlbWVudCApO1xyXG4gICAgc29tZS52ZWMyLmNvcHkoIHRoaXMub3JpZ2luVmVydHNbIGkgXSwgdGhpcy5mcm9tVmVydHNbIGkgXSApO1xyXG4gICAgc29tZS52ZWMyLmFkZCggdGhpcy5mcm9tVmVydHNbIGkgXSwgbW92ZW1lbnQsIHRoaXMuZnJvbVZlcnRzWyBpIF0gKTtcclxuICAgIHNvbWUudmVjMi5yb3RhdGUoIG1vdmVtZW50LCAtIGFuZ2xlLCBtb3ZlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5sYXlvdXQucHJvdG90eXBlLnJldHJpZXZlID0gZnVuY3Rpb24gKCBpbmRleCApIHtcclxuICByZXR1cm4ge1xyXG4gICAgZnJvbTogdGhpcy5mcm9tVmVydHNbIGluZGV4IF0sXHJcbiAgICB0bzogdGhpcy50b1ZlcnRzWyBpbmRleCBdXHJcbiAgfTtcclxufTtcclxuXHJcbnNvbWUubGF5b3V0ID0gbGF5b3V0O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBzb21lOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBzb21lID0gcmVxdWlyZSggJy4vc29tZS5jb3JlJyApO1xyXG5cclxuLyoqIFxyXG4gKiBQZXJsaW5TaW1wbGV4IDEuMlxyXG4gKiBQb3J0ZWQgZnJvbSBTdGVmYW4gR3VzdGF2c29uJ3MgamF2YSBpbXBsZW1lbnRhdGlvbiBieSBTZWFuIE1jQ3VsbG91Z2ggYmFua3NlYW5AZ21haWwuY29tXHJcbiAqIGh0dHA6Ly9zdGFmZnd3dy5pdG4ubGl1LnNlL35zdGVndS9zaW1wbGV4bm9pc2Uvc2ltcGxleG5vaXNlLnBkZlxyXG4gKiBSZWFkIFN0ZWZhbidzIGV4Y2VsbGVudCBwYXBlciBmb3IgZGV0YWlscyBvbiBob3cgdGhpcyBjb2RlIHdvcmtzLlxyXG4gKiBvY3RhdmVzIGFuZCBmYWxsb2ZmIGltcGxlbWVudGF0aW9uIChhbmQgcGFzc2luZyBqc2xpbnQpIGJ5IFJvbiBWYWxzdGFyXHJcbiAqIGFsc28gaW1wbGVtZW50ZWQgS2Fyc3RlbiBTY2htaWR0J3MgaW1wbGVtZW50YXRpb25cclxuICovXHJcblxyXG52YXIgbm9pc2UgPSBmdW5jdGlvbiggc2VlZCApIHtcclxuXHJcbiAgdGhpcy5GMiA9IDAuNSooTWF0aC5zcXJ0KDMpLTEpO1xyXG4gIHRoaXMuRzIgPSAoMy1NYXRoLnNxcnQoMykpLzY7XHJcbiAgdGhpcy5HMjIgPSAyKnRoaXMuRzIgLSAxO1xyXG4gIHRoaXMuRjMgPSAxLzM7XHJcbiAgdGhpcy5HMyA9IDEvNjtcclxuICB0aGlzLkY0ID0gKE1hdGguc3FydCg1KSAtIDEpLzQ7XHJcbiAgdGhpcy5HNCA9ICg1IC0gTWF0aC5zcXJ0KDUpKS8yMDtcclxuICB0aGlzLkc0MiA9IHRoaXMuRzQqMjtcclxuICB0aGlzLkc0MyA9IHRoaXMuRzQqMztcclxuICB0aGlzLkc0NCA9IHRoaXMuRzQqNCAtIDE7XHJcblxyXG4gIC8vIEdyYWRpZW50IHZlY3RvcnMgZm9yIDNEIChwb2ludGluZyB0byBtaWQgcG9pbnRzIG9mIGFsbCBlZGdlcyBvZiBhIHVuaXQgY3ViZSlcclxuICB0aGlzLmFHcmFkMyA9IFsgWzEsMSwwXSxbLTEsMSwwXSxbMSwtMSwwXSxbLTEsLTEsMF0sWzEsMCwxXSxbLTEsMCwxXSxbMSwwLC0xXSxbLTEsMCwtMV0sWzAsMSwxXSxbMCwtMSwxXSxbMCwxLC0xXSxbMCwtMSwtMV0gXTtcclxuXHJcbiAgLy8gR3JhZGllbnQgdmVjdG9ycyBmb3IgNEQgKHBvaW50aW5nIHRvIG1pZCBwb2ludHMgb2YgYWxsIGVkZ2VzIG9mIGEgdW5pdCA0RCBoeXBlcmN1YmUpXHJcbiAgdGhpcy5ncmFkNCA9IFsgWzAsMSwxLDFdLFswLDEsMSwtMV0sWzAsMSwtMSwxXSxbMCwxLC0xLC0xXSxbMCwtMSwxLDFdLFswLC0xLDEsLTFdLFswLC0xLC0xLDFdLFswLC0xLC0xLC0xXSxbMSwwLDEsMV0sWzEsMCwxLC0xXSxbMSwwLC0xLDFdLFsxLDAsLTEsLTFdLFstMSwwLDEsMV0sWy0xLDAsMSwtMV0sWy0xLDAsLTEsMV0sWy0xLDAsLTEsLTFdLFsxLDEsMCwxXSxbMSwxLDAsLTFdLFsxLC0xLDAsMV0sWzEsLTEsMCwtMV0sWy0xLDEsMCwxXSxbLTEsMSwwLC0xXSxbLTEsLTEsMCwxXSxbLTEsLTEsMCwtMV0sWzEsMSwxLDBdLFsxLDEsLTEsMF0sWzEsLTEsMSwwXSxbMSwtMSwtMSwwXSxbLTEsMSwxLDBdLFstMSwxLC0xLDBdLFstMSwtMSwxLDBdLFstMSwtMSwtMSwwXSBdO1xyXG5cclxuXHJcbiAgLy8gQSBsb29rdXAgdGFibGUgdG8gdHJhdmVyc2UgdGhlIHNpbXBsZXggYXJvdW5kIGEgZ2l2ZW4gcG9pbnQgaW4gNEQuIFxyXG4gIC8vIERldGFpbHMgY2FuIGJlIGZvdW5kIHdoZXJlIHRoaXMgdGFibGUgaXMgdXNlZCwgaW4gdGhlIDREIG5vaXNlIG1ldGhvZC4gXHJcbiAgdGhpcy5zaW1wbGV4ID0gWyBbMCwxLDIsM10sWzAsMSwzLDJdLFswLDAsMCwwXSxbMCwyLDMsMV0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzEsMiwzLDBdLFswLDIsMSwzXSxbMCwwLDAsMF0sWzAsMywxLDJdLFswLDMsMiwxXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMSwzLDIsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMSwyLDAsM10sWzAsMCwwLDBdLFsxLDMsMCwyXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMiwzLDAsMV0sWzIsMywxLDBdLFsxLDAsMiwzXSxbMSwwLDMsMl0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzIsMCwzLDFdLFswLDAsMCwwXSxbMiwxLDMsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMiwwLDEsM10sWzAsMCwwLDBdLFswLDAsMCwwXSxbMCwwLDAsMF0sWzMsMCwxLDJdLFszLDAsMiwxXSxbMCwwLDAsMF0sWzMsMSwyLDBdLFsyLDEsMCwzXSxbMCwwLDAsMF0sWzAsMCwwLDBdLFswLDAsMCwwXSxbMywxLDAsMl0sWzAsMCwwLDBdLFszLDIsMCwxXSxbMywyLDEsMF0gXTtcclxuICBcclxuICAvLyBUbyByZW1vdmUgdGhlIG5lZWQgZm9yIGluZGV4IHdyYXBwaW5nLCBkb3VibGUgdGhlIHBlcm11dGF0aW9uIHRhYmxlIGxlbmd0aFxyXG4gIC8vdGhpcy5hUGVybTtcclxuICAvL3RoaXMuYU9jdEZyZXE7IC8vIGZyZXF1ZW5jeSBwZXIgb2N0YXZlXHJcbiAgLy90aGlzLmFPY3RQZXJzOyAvLyBwZXJzaXN0ZW5jZSBwZXIgb2N0YXZlXHJcblxyXG4gIHRoaXMuaU9jdGF2ZXMgPSAxO1xyXG4gIHRoaXMuZlBlcnNpc3RlbmNlID0gMC41O1xyXG4gIHRoaXMuZlBlcnNNYXggPSAwOyAvLyAxIC8gbWF4IHBlcnNpc3RlbmNlXHJcblxyXG4gIHRoaXMucmFuZG9tID0gbmV3IHNvbWUucmFuZG9tKCBzZWVkICk7XHJcblxyXG4gIC8vIGluaXRcclxuICB0aGlzLnNldFBlcm0oKTtcclxuICB0aGlzLm9jdEZyZXFQZXJzKCk7XHJcbn07XHJcblxyXG4vLyAxRCBkb3Rwcm9kdWN0XHJcbm5vaXNlLnByb3RvdHlwZS5kb3QxID0gZnVuY3Rpb24gZG90MShnLCB4KSB7IFxyXG4gIHJldHVybiBnWzBdKng7XHJcbn07XHJcblxyXG4vLyAyRCBkb3Rwcm9kdWN0XHJcbm5vaXNlLnByb3RvdHlwZS5kb3QyID0gZnVuY3Rpb24gZG90MihnLCB4LCB5KSB7XHJcbiAgcmV0dXJuIGdbMF0qeCArIGdbMV0qeTtcclxufTtcclxuXHJcbi8vIDNEIGRvdHByb2R1Y3Rcclxubm9pc2UucHJvdG90eXBlLmRvdDMgPSBmdW5jdGlvbiBkb3QzKGcsIHgsIHksIHopIHtcclxuICByZXR1cm4gZ1swXSp4ICsgZ1sxXSp5ICsgZ1syXSp6O1xyXG59O1xyXG5cclxuLy8gNEQgZG90cHJvZHVjdFxyXG5ub2lzZS5wcm90b3R5cGUuZG90NCA9IGZ1bmN0aW9uIGRvdDQoZywgeCwgeSwgeiwgdykge1xyXG4gIHJldHVybiBnWzBdKnggKyBnWzFdKnkgKyBnWzJdKnogKyBnWzNdKnc7XHJcbn07XHJcblxyXG4vLyBub2lzZTJkXHJcbm5vaXNlLnByb3RvdHlwZS50d29kID0gZnVuY3Rpb24gKHgsIHkpIHtcclxuICB2YXIgZztcclxuICB2YXIgbjAsIG4xLCBuMjtcclxuICB2YXIgcztcclxuICB2YXIgaSwgajtcclxuICB2YXIgdDtcclxuICB2YXIgeDAsIHkwO1xyXG4gIHZhciBpMSwgajE7XHJcbiAgdmFyIHgxLCB5MTtcclxuICB2YXIgeDIsIHkyO1xyXG4gIHZhciBpaSwgamo7XHJcbiAgdmFyIGdpMCwgZ2kxLCBnaTI7XHJcbiAgdmFyIHQwLCB0MSwgdDI7XHJcblxyXG4gIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW4gXHJcbiAgcyA9ICh4K3kpKnRoaXMuRjI7IC8vIEhhaXJ5IGZhY3RvciBmb3IgMkQgXHJcbiAgaSA9IE1hdGguZmxvb3IoeCtzKTsgXHJcbiAgaiA9IE1hdGguZmxvb3IoeStzKTsgXHJcbiAgdCA9IChpK2opKnRoaXMuRzI7IFxyXG4gIHgwID0geCAtIChpIC0gdCk7IC8vIFVuc2tldyB0aGUgY2VsbCBvcmlnaW4gYmFjayB0byAoeCx5KSBzcGFjZSBcclxuICB5MCA9IHkgLSAoaiAtIHQpOyAvLyBUaGUgeCx5IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpbiBcclxuICAvLyBGb3IgdGhlIDJEIGNhc2UsIHRoZSBzaW1wbGV4IHNoYXBlIGlzIGFuIGVxdWlsYXRlcmFsIHRyaWFuZ2xlLiBcclxuICAvLyBEZXRlcm1pbmUgd2hpY2ggc2ltcGxleCB3ZSBhcmUgaW4uIFxyXG4gIC8vIE9mZnNldHMgZm9yIHNlY29uZCAobWlkZGxlKSBjb3JuZXIgb2Ygc2ltcGxleCBpbiAoaSxqKSBjb29yZHMgXHJcbiAgaWYgKHgwPnkwKSB7IC8vIGxvd2VyIHRyaWFuZ2xlLCBYWSBvcmRlcjogKDAsMCktPigxLDApLT4oMSwxKVxyXG4gICAgaTEgPSAxO1xyXG4gICAgajEgPSAwO1xyXG4gIH0gIGVsc2UgeyAvLyB1cHBlciB0cmlhbmdsZSwgWVggb3JkZXI6ICgwLDApLT4oMCwxKS0+KDEsMSlcclxuICAgIGkxID0gMDtcclxuICAgIGoxID0gMTtcclxuICB9XHJcbiAgLy8gQSBzdGVwIG9mICgxLDApIGluIChpLGopIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jKSBpbiAoeCx5KSwgYW5kIFxyXG4gIC8vIGEgc3RlcCBvZiAoMCwxKSBpbiAoaSxqKSBtZWFucyBhIHN0ZXAgb2YgKC1jLDEtYykgaW4gKHgseSksIHdoZXJlIFxyXG4gIC8vIGMgPSAoMy1zcXJ0KDMpKS82IFxyXG4gIHgxID0geDAgLSBpMSArIHRoaXMuRzI7IC8vIE9mZnNldHMgZm9yIG1pZGRsZSBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzIFxyXG4gIHkxID0geTAgLSBqMSArIHRoaXMuRzI7IFxyXG4gIHgyID0geDAgKyB0aGlzLkcyMjsgLy8gT2Zmc2V0cyBmb3IgbGFzdCBjb3JuZXIgaW4gKHgseSkgdW5za2V3ZWQgY29vcmRzIFxyXG4gIHkyID0geTAgKyB0aGlzLkcyMjsgXHJcbiAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSB0aHJlZSBzaW1wbGV4IGNvcm5lcnMgXHJcbiAgaWkgPSBpJjI1NTsgXHJcbiAgamogPSBqJjI1NTsgXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgdGhyZWUgY29ybmVycyBcclxuICB0MCA9IDAuNSAtIHgwKngwLXkwKnkwOyBcclxuICBpZiAodDA8MCkge1xyXG4gICAgbjAgPSAwOyBcclxuICB9IGVsc2UgeyBcclxuICAgIHQwICo9IHQwOyBcclxuICAgIGdpMCA9IHRoaXMuYVBlcm1baWkrdGhpcy5hUGVybVtqal1dICUgMTI7IFxyXG4gICAgbjAgPSB0MCAqIHQwICogdGhpcy5kb3QyKHRoaXMuYUdyYWQzW2dpMF0sIHgwLCB5MCk7ICAvLyAoeCx5KSBvZiBhR3JhZDMgdXNlZCBmb3IgMkQgZ3JhZGllbnQgXHJcbiAgfSBcclxuICB0MSA9IDAuNSAtIHgxKngxLXkxKnkxOyBcclxuICBpZiAodDE8MCkge1xyXG4gICAgbjEgPSAwOyBcclxuICB9IGVsc2UgeyBcclxuICAgIHQxICo9IHQxOyBcclxuICAgIGdpMSA9IHRoaXMuYVBlcm1baWkraTErdGhpcy5hUGVybVtqaitqMV1dICUgMTI7IFxyXG4gICAgbjEgPSB0MSAqIHQxICogdGhpcy5kb3QyKHRoaXMuYUdyYWQzW2dpMV0sIHgxLCB5MSk7IFxyXG4gIH1cclxuICB0MiA9IDAuNSAtIHgyKngyLXkyKnkyOyBcclxuICBpZiAodDI8MCkge1xyXG4gICAgbjIgPSAwOyBcclxuICB9IGVsc2UgeyBcclxuICAgIHQyICo9IHQyOyBcclxuICAgIGdpMiA9IHRoaXMuYVBlcm1baWkrMSt0aGlzLmFQZXJtW2pqKzFdXSAlIDEyOyBcclxuICAgIG4yID0gdDIgKiB0MiAqIHRoaXMuZG90Mih0aGlzLmFHcmFkM1tnaTJdLCB4MiwgeTIpOyBcclxuICB9IFxyXG4gIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS4gXHJcbiAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gcmV0dXJuIHZhbHVlcyBpbiB0aGUgaW50ZXJ2YWwgWzAsMV0uXHJcbiAgcmV0dXJuIDcwICogKG4wICsgbjEgKyBuMik7XHJcbn07XHJcblxyXG4vLyBub2lzZTNkXHJcbm5vaXNlLnByb3RvdHlwZS50aHJlZWQgPSBmdW5jdGlvbiB0aHJlZWQoeCx5LHopIHtcclxuICB2YXIgZztcclxuICB2YXIgbjAsIG4xLCBuMiwgbjM7XHJcbiAgdmFyIHM7XHJcbiAgdmFyIGksIGosIGs7XHJcbiAgdmFyIHQ7XHJcbiAgdmFyIHgwLCB5MCwgejA7XHJcbiAgdmFyIGkxLCBqMSwgazE7XHJcbiAgdmFyIGkyLCBqMiwgazI7XHJcbiAgdmFyIHgxLCB5MSwgejE7XHJcbiAgdmFyIHgyLCB5MiwgejI7XHJcbiAgdmFyIHgzLCB5MywgejM7XHJcbiAgdmFyIGlpLCBqaiwga2s7XHJcbiAgdmFyIGdpMCwgZ2kxLCBnaTIsIGdpMztcclxuICB2YXIgdDAsIHQxLCB0MiwgdDM7XHJcblxyXG4gIC8vIE5vaXNlIGNvbnRyaWJ1dGlvbnMgZnJvbSB0aGUgZm91ciBjb3JuZXJzIFxyXG4gIC8vIFNrZXcgdGhlIGlucHV0IHNwYWNlIHRvIGRldGVybWluZSB3aGljaCBzaW1wbGV4IGNlbGwgd2UncmUgaW4gXHJcbiAgcyA9ICh4K3kreikqdGhpcy5GMzsgLy8gVmVyeSBuaWNlIGFuZCBzaW1wbGUgc2tldyBmYWN0b3IgZm9yIDNEIFxyXG4gIGkgPSBNYXRoLmZsb29yKHgrcyk7IFxyXG4gIGogPSBNYXRoLmZsb29yKHkrcyk7IFxyXG4gIGsgPSBNYXRoLmZsb29yKHorcyk7IFxyXG4gIHQgPSAoaStqK2spKnRoaXMuRzM7XHJcbiAgeDAgPSB4IC0gKGkgLSB0KTsgLy8gVW5za2V3IHRoZSBjZWxsIG9yaWdpbiBiYWNrIHRvICh4LHkseikgc3BhY2UgXHJcbiAgeTAgPSB5IC0gKGogLSB0KTsgLy8gVGhlIHgseSx6IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpbiBcclxuICB6MCA9IHogLSAoayAtIHQpOyBcclxuXHJcbiAgLy8gRm9yIHRoZSAzRCBjYXNlLCB0aGUgc2ltcGxleCBzaGFwZSBpcyBhIHNsaWdodGx5IGlycmVndWxhciB0ZXRyYWhlZHJvbi4gXHJcbiAgLy8gRGV0ZXJtaW5lIHdoaWNoIHNpbXBsZXggd2UgYXJlIGluLiBcclxuICAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHMgXHJcbiAgLy8gT2Zmc2V0cyBmb3IgdGhpcmQgY29ybmVyIG9mIHNpbXBsZXggaW4gKGksaixrKSBjb29yZHMgXHJcbiAgaWYgKHgwPj15MCkgeyBcclxuICAgIGlmICh5MD49ejApIHsgLy8gWCBZIFogb3JkZXJcclxuICAgICAgaTEgPSAxO1xyXG4gICAgICBqMSA9IDA7XHJcbiAgICAgIGsxID0gMDtcclxuICAgICAgaTIgPSAxO1xyXG4gICAgICBqMiA9IDE7XHJcbiAgICAgIGsyID0gMDtcclxuICAgIH0gZWxzZSBpZiAoeDA+PXowKSB7IC8vIFggWiBZIG9yZGVyXHJcbiAgICAgIGkxID0gMTtcclxuICAgICAgajEgPSAwO1xyXG4gICAgICBrMSA9IDA7XHJcbiAgICAgIGkyID0gMTtcclxuICAgICAgajIgPSAwO1xyXG4gICAgICBrMiA9IDE7XHJcbiAgICB9IGVsc2UgeyAvLyBaIFggWSBvcmRlclxyXG4gICAgICBpMSA9IDA7XHJcbiAgICAgIGoxID0gMDtcclxuICAgICAgazEgPSAxO1xyXG4gICAgICBpMiA9IDE7XHJcbiAgICAgIGoyID0gMDtcclxuICAgICAgazIgPSAxO1xyXG4gICAgfSBcclxuICB9IGVsc2UgeyAvLyB4MDx5MCBcclxuICAgIGlmICh5MDx6MCkgeyAvLyBaIFkgWCBvcmRlclxyXG4gICAgICBpMSA9IDA7XHJcbiAgICAgIGoxID0gMDtcclxuICAgICAgazEgPSAxO1xyXG4gICAgICBpMiA9IDA7XHJcbiAgICAgIGoyID0gMTtcclxuICAgICAgazIgPSAxO1xyXG4gICAgfSBlbHNlIGlmICh4MDx6MCkgeyAvLyBZIFogWCBvcmRlclxyXG4gICAgICBpMSA9IDA7XHJcbiAgICAgIGoxID0gMTtcclxuICAgICAgazEgPSAwO1xyXG4gICAgICBpMiA9IDA7XHJcbiAgICAgIGoyID0gMTtcclxuICAgICAgazIgPSAxO1xyXG4gICAgfSBlbHNlIHsgLy8gWSBYIFogb3JkZXJcclxuICAgICAgaTEgPSAwO1xyXG4gICAgICBqMSA9IDE7XHJcbiAgICAgIGsxID0gMDtcclxuICAgICAgaTIgPSAxO1xyXG4gICAgICBqMiA9IDE7XHJcbiAgICAgIGsyID0gMDtcclxuICAgIH1cclxuICB9IFxyXG5cclxuICAvLyBBIHN0ZXAgb2YgKDEsMCwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoMS1jLC1jLC1jKSBpbiAoeCx5LHopLCBcclxuICAvLyBhIHN0ZXAgb2YgKDAsMSwwKSBpbiAoaSxqLGspIG1lYW5zIGEgc3RlcCBvZiAoLWMsMS1jLC1jKSBpbiAoeCx5LHopLCBhbmQgXHJcbiAgLy8gYSBzdGVwIG9mICgwLDAsMSkgaW4gKGksaixrKSBtZWFucyBhIHN0ZXAgb2YgKC1jLC1jLDEtYykgaW4gKHgseSx6KSwgd2hlcmUgXHJcbiAgLy8gYyA9IDEvNi5cclxuICB4MSA9IHgwIC0gaTEgKyB0aGlzLkczOyAvLyBPZmZzZXRzIGZvciBzZWNvbmQgY29ybmVyIGluICh4LHkseikgY29vcmRzIFxyXG4gIHkxID0geTAgLSBqMSArIHRoaXMuRzM7IFxyXG4gIHoxID0gejAgLSBrMSArIHRoaXMuRzM7IFxyXG4gIHgyID0geDAgLSBpMiArIHRoaXMuRjM7IC8vIE9mZnNldHMgZm9yIHRoaXJkIGNvcm5lciBpbiAoeCx5LHopIGNvb3JkcyBcclxuICB5MiA9IHkwIC0gajIgKyB0aGlzLkYzOyBcclxuICB6MiA9IHowIC0gazIgKyB0aGlzLkYzOyBcclxuICB4MyA9IHgwIC0gMC41OyAvLyBPZmZzZXRzIGZvciBsYXN0IGNvcm5lciBpbiAoeCx5LHopIGNvb3JkcyBcclxuICB5MyA9IHkwIC0gMC41OyBcclxuICB6MyA9IHowIC0gMC41OyBcclxuXHJcbiAgLy8gV29yayBvdXQgdGhlIGhhc2hlZCBncmFkaWVudCBpbmRpY2VzIG9mIHRoZSBmb3VyIHNpbXBsZXggY29ybmVycyBcclxuICBpaSA9IGkmMjU1OyBcclxuICBqaiA9IGomMjU1OyBcclxuICBrayA9IGsmMjU1OyBcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZm91ciBjb3JuZXJzIFxyXG4gIHQwID0gMC42IC0geDAqeDAgLSB5MCp5MCAtIHowKnowOyBcclxuICBpZiAodDA8MCkge1xyXG4gICAgbjAgPSAwOyBcclxuICB9IGVsc2UgeyBcclxuICAgIHQwICo9IHQwOyBcclxuICAgIGdpMCA9IHRoaXMuYVBlcm1baWkrdGhpcy5hUGVybVtqait0aGlzLmFQZXJtW2trXV1dICUgMTI7IFxyXG4gICAgbjAgPSB0MCAqIHQwICogdGhpcy5kb3QzKHRoaXMuYUdyYWQzW2dpMF0sIHgwLCB5MCwgejApOyBcclxuICB9XHJcbiAgdDEgPSAwLjYgLSB4MSp4MSAtIHkxKnkxIC0gejEqejE7IFxyXG4gIGlmICh0MTwwKSB7XHJcbiAgICBuMSA9IDA7IFxyXG4gIH0gZWxzZSB7IFxyXG4gICAgdDEgKj0gdDE7IFxyXG4gICAgZ2kxID0gdGhpcy5hUGVybVtpaStpMSt0aGlzLmFQZXJtW2pqK2oxK3RoaXMuYVBlcm1ba2srazFdXV0gJSAxMjsgXHJcbiAgICBuMSA9IHQxICogdDEgKiB0aGlzLmRvdDModGhpcy5hR3JhZDNbZ2kxXSwgeDEsIHkxLCB6MSk7IFxyXG4gIH0gXHJcbiAgdDIgPSAwLjYgLSB4Mip4MiAtIHkyKnkyIC0gejIqejI7IFxyXG4gIGlmICh0MjwwKSB7XHJcbiAgICBuMiA9IDA7IFxyXG4gIH0gZWxzZSB7IFxyXG4gICAgdDIgKj0gdDI7IFxyXG4gICAgZ2kyID0gdGhpcy5hUGVybVtpaStpMit0aGlzLmFQZXJtW2pqK2oyK3RoaXMuYVBlcm1ba2srazJdXV0gJSAxMjsgXHJcbiAgICBuMiA9IHQyICogdDIgKiB0aGlzLmRvdDModGhpcy5hR3JhZDNbZ2kyXSwgeDIsIHkyLCB6Mik7IFxyXG4gIH0gXHJcbiAgdDMgPSAwLjYgLSB4Myp4MyAtIHkzKnkzIC0gejMqejM7IFxyXG4gIGlmICh0MzwwKSB7XHJcbiAgICBuMyA9IDA7IFxyXG4gIH0gZWxzZSB7IFxyXG4gICAgdDMgKj0gdDM7IFxyXG4gICAgZ2kzID0gdGhpcy5hUGVybVtpaSsxK3RoaXMuYVBlcm1bamorMSt0aGlzLmFQZXJtW2trKzFdXV0gJSAxMjsgXHJcbiAgICBuMyA9IHQzICogdDMgKiB0aGlzLmRvdDModGhpcy5hR3JhZDNbZ2kzXSwgeDMsIHkzLCB6Myk7IFxyXG4gIH0gXHJcblxyXG4gIC8vIEFkZCBjb250cmlidXRpb25zIGZyb20gZWFjaCBjb3JuZXIgdG8gZ2V0IHRoZSBmaW5hbCBub2lzZSB2YWx1ZS4gXHJcbiAgLy8gVGhlIHJlc3VsdCBpcyBzY2FsZWQgdG8gc3RheSBqdXN0IGluc2lkZSBbMCwxXSBcclxuICByZXR1cm4gMzIgKiAobjAgKyBuMSArIG4yICsgbjMpO1xyXG59O1xyXG5cclxuLy8gbm9pc2U0ZFxyXG5ub2lzZS5wcm90b3R5cGUuZm91cmQgPSBmdW5jdGlvbiBmb3VyZCh4LHkseix3KSB7XHJcbiAgdmFyIGc7XHJcbiAgdmFyIG4wLCBuMSwgbjIsIG4zLCBuNDtcclxuICB2YXIgcztcclxuICB2YXIgYztcclxuICB2YXIgc2M7XHJcbiAgdmFyIGksIGosIGssIGw7XHJcbiAgdmFyIHQ7XHJcbiAgdmFyIHgwLCB5MCwgejAsIHcwO1xyXG4gIHZhciBpMSwgajEsIGsxLCBsMTtcclxuICB2YXIgaTIsIGoyLCBrMiwgbDI7XHJcbiAgdmFyIGkzLCBqMywgazMsIGwzO1xyXG4gIHZhciB4MSwgeTEsIHoxLCB3MTtcclxuICB2YXIgeDIsIHkyLCB6MiwgdzI7XHJcbiAgdmFyIHgzLCB5MywgejMsIHczO1xyXG4gIHZhciB4NCwgeTQsIHo0LCB3NDtcclxuICB2YXIgaWksIGpqLCBraywgbGw7XHJcbiAgdmFyIGdpMCwgZ2kxLCBnaTIsIGdpMywgZ2k0O1xyXG4gIHZhciB0MCwgdDEsIHQyLCB0MywgdDQ7XHJcblxyXG4gIC8vIGZyb20gdGhlIGZpdmUgY29ybmVyc1xyXG4gIC8vIFNrZXcgdGhlICh4LHkseix3KSBzcGFjZSB0byBkZXRlcm1pbmUgd2hpY2ggY2VsbCBvZiAyNCBzaW1wbGljZXNcclxuICBzID0gKHggKyB5ICsgeiArIHcpICogdGhpcy5GNDsgLy8gRmFjdG9yIGZvciA0RCBza2V3aW5nXHJcbiAgaSA9IE1hdGguZmxvb3IoeCArIHMpO1xyXG4gIGogPSBNYXRoLmZsb29yKHkgKyBzKTtcclxuICBrID0gTWF0aC5mbG9vcih6ICsgcyk7XHJcbiAgbCA9IE1hdGguZmxvb3IodyArIHMpO1xyXG4gIHQgPSAoaSArIGogKyBrICsgbCkgKiB0aGlzLkc0OyAvLyBGYWN0b3IgZm9yIDREIHVuc2tld2luZ1xyXG4gIHgwID0geCAtIChpIC0gdCk7IC8vIFRoZSB4LHkseix3IGRpc3RhbmNlcyBmcm9tIHRoZSBjZWxsIG9yaWdpblxyXG4gIHkwID0geSAtIChqIC0gdCk7XHJcbiAgejAgPSB6IC0gKGsgLSB0KTtcclxuICB3MCA9IHcgLSAobCAtIHQpO1xyXG5cclxuICAvLyBGb3IgdGhlIDREIGNhc2UsIHRoZSBzaW1wbGV4IGlzIGEgNEQgc2hhcGUgSSB3b24ndCBldmVuIHRyeSB0byBkZXNjcmliZS5cclxuICAvLyBUbyBmaW5kIG91dCB3aGljaCBvZiB0aGUgMjQgcG9zc2libGUgc2ltcGxpY2VzIHdlJ3JlIGluLCB3ZSBuZWVkIHRvIGRldGVybWluZSB0aGUgbWFnbml0dWRlIG9yZGVyaW5nIG9mIHgwLCB5MCwgejAgYW5kIHcwLlxyXG4gIC8vIFRoZSBtZXRob2QgYmVsb3cgaXMgYSBnb29kIHdheSBvZiBmaW5kaW5nIHRoZSBvcmRlcmluZyBvZiB4LHkseix3IGFuZCB0aGVuIGZpbmQgdGhlIGNvcnJlY3QgdHJhdmVyc2FsIG9yZGVyIGZvciB0aGUgc2ltcGxleCB3ZXJlIGluLlxyXG4gIC8vIEZpcnN0LCBzaXggcGFpci13aXNlIGNvbXBhcmlzb25zIGFyZSBwZXJmb3JtZWQgYmV0d2VlbiBlYWNoIHBvc3NpYmxlIHBhaXIgb2YgdGhlIGZvdXIgY29vcmRpbmF0ZXMsIGFuZCB0aGUgcmVzdWx0cyBhcmUgdXNlZCB0byBhZGQgdXAgYmluYXJ5IGJpdHMgZm9yIGFuIGludGVnZXIgaW5kZXguXHJcbiAgYyA9IDA7XHJcbiAgaWYgKHgwPnkwKSB7XHJcbiAgICBjID0gMHgyMDtcclxuICB9XHJcbiAgaWYgKHgwPnowKSB7XHJcbiAgICBjIHw9IDB4MTA7XHJcbiAgfVxyXG4gIGlmICh5MD56MCkge1xyXG4gICAgYyB8PSAweDA4O1xyXG4gIH1cclxuICBpZiAoeDA+dzApIHtcclxuICAgIGMgfD0gMHgwNDtcclxuICB9XHJcbiAgaWYgKHkwPncwKSB7XHJcbiAgICBjIHw9IDB4MDI7XHJcbiAgfVxyXG4gIGlmICh6MD53MCkge1xyXG4gICAgYyB8PSAweDAxO1xyXG4gIH1cclxuXHJcbiAgLy8gc2ltcGxleFtjXSBpcyBhIDQtdmVjdG9yIHdpdGggdGhlIG51bWJlcnMgMCwgMSwgMiBhbmQgMyBpbiBzb21lXHJcbiAgLy8gb3JkZXIuIE1hbnkgdmFsdWVzIG9mIGMgd2lsbCBuZXZlciBvY2N1ciwgc2luY2UgZS5nLiB4Pnk+ej53IG1ha2VzXHJcbiAgLy8geDx6LCB5PHcgYW5kIHg8dyBpbXBvc3NpYmxlLiBPbmx5IHRoZSAyNCBpbmRpY2VzIHdoaWNoIGhhdmUgbm9uLXplcm9cclxuICAvLyBlbnRyaWVzIG1ha2UgYW55IHNlbnNlLiBXZSB1c2UgYSB0aHJlc2hvbGRpbmcgdG8gc2V0IHRoZSBjb29yZGluYXRlc1xyXG4gIC8vIGluIHR1cm4gZnJvbSB0aGUgbGFyZ2VzdCBtYWduaXR1ZGUuIFRoZSBudW1iZXIgMyBpbiB0aGUgXCJzaW1wbGV4XCJcclxuICAvLyBhcnJheSBpcyBhdCB0aGUgcG9zaXRpb24gb2YgdGhlIGxhcmdlc3QgY29vcmRpbmF0ZS5cclxuICBzYyA9IHRoaXMuc2ltcGxleFtjXTtcclxuICBpMSA9IHNjWzBdID49IDMgPyAxIDogMDtcclxuICBqMSA9IHNjWzFdID49IDMgPyAxIDogMDtcclxuICBrMSA9IHNjWzJdID49IDMgPyAxIDogMDtcclxuICBsMSA9IHNjWzNdID49IDMgPyAxIDogMDtcclxuXHJcbiAgLy8gVGhlIG51bWJlciAyIGluIHRoZSBcInNpbXBsZXhcIiBhcnJheSBpcyBhdCB0aGUgc2Vjb25kIGxhcmdlc3RcclxuICAvLyBjb29yZGluYXRlLlxyXG4gIGkyID0gc2NbMF0gPj0gMiA/IDEgOiAwO1xyXG4gIGoyID0gc2NbMV0gPj0gMiA/IDEgOiAwO1xyXG4gIGsyID0gc2NbMl0gPj0gMiA/IDEgOiAwO1xyXG4gIGwyID0gc2NbM10gPj0gMiA/IDEgOiAwO1xyXG5cclxuICAvLyBUaGUgbnVtYmVyIDEgaW4gdGhlIFwic2ltcGxleFwiIGFycmF5IGlzIGF0IHRoZSBzZWNvbmQgc21hbGxlc3RcclxuICAvLyBjb29yZGluYXRlLlxyXG4gIGkzID0gc2NbMF0gPj0gMSA/IDEgOiAwO1xyXG4gIGozID0gc2NbMV0gPj0gMSA/IDEgOiAwO1xyXG4gIGszID0gc2NbMl0gPj0gMSA/IDEgOiAwO1xyXG4gIGwzID0gc2NbM10gPj0gMSA/IDEgOiAwO1xyXG4gIC8vIFRoZSBmaWZ0aCBjb3JuZXIgaGFzIGFsbCBjb29yZGluYXRlIG9mZnNldHMgPSAxLCBzbyBubyBuZWVkIHRvIGxvb2tcclxuICAvLyB0aGF0IHVwLlxyXG4gIHgxID0geDAgLSBpMSArIHRoaXMuRzQ7IC8vIE9mZnNldHMgZm9yIHNlY29uZCBjb3JuZXIgaW4gKHgseSx6LHcpXHJcbiAgeTEgPSB5MCAtIGoxICsgdGhpcy5HNDtcclxuICB6MSA9IHowIC0gazEgKyB0aGlzLkc0O1xyXG4gIHcxID0gdzAgLSBsMSArIHRoaXMuRzQ7XHJcblxyXG4gIHgyID0geDAgLSBpMiArIHRoaXMuRzQyOyAvLyBPZmZzZXRzIGZvciB0aGlyZCBjb3JuZXIgaW4gKHgseSx6LHcpXHJcbiAgeTIgPSB5MCAtIGoyICsgdGhpcy5HNDI7XHJcbiAgejIgPSB6MCAtIGsyICsgdGhpcy5HNDI7XHJcbiAgdzIgPSB3MCAtIGwyICsgdGhpcy5HNDI7XHJcblxyXG4gIHgzID0geDAgLSBpMyArIHRoaXMuRzQzOyAvLyBPZmZzZXRzIGZvciBmb3VydGggY29ybmVyIGluICh4LHkseix3KVxyXG4gIHkzID0geTAgLSBqMyArIHRoaXMuRzQzO1xyXG4gIHozID0gejAgLSBrMyArIHRoaXMuRzQzO1xyXG4gIHczID0gdzAgLSBsMyArIHRoaXMuRzQzO1xyXG5cclxuICB4NCA9IHgwICsgdGhpcy5HNDQ7IC8vIE9mZnNldHMgZm9yIGxhc3QgY29ybmVyIGluICh4LHkseix3KVxyXG4gIHk0ID0geTAgKyB0aGlzLkc0NDtcclxuICB6NCA9IHowICsgdGhpcy5HNDQ7XHJcbiAgdzQgPSB3MCArIHRoaXMuRzQ0O1xyXG5cclxuICAvLyBXb3JrIG91dCB0aGUgaGFzaGVkIGdyYWRpZW50IGluZGljZXMgb2YgdGhlIGZpdmUgc2ltcGxleCBjb3JuZXJzXHJcbiAgaWkgPSBpJjI1NTtcclxuICBqaiA9IGomMjU1O1xyXG4gIGtrID0gayYyNTU7XHJcbiAgbGwgPSBsJjI1NTtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBjb250cmlidXRpb24gZnJvbSB0aGUgZml2ZSBjb3JuZXJzXHJcbiAgdDAgPSAwLjYgLSB4MCp4MCAtIHkwKnkwIC0gejAqejAgLSB3MCp3MDtcclxuICBpZiAodDA8MCkge1xyXG4gICAgbjAgPSAwOyBcclxuICB9IGVsc2UgeyBcclxuICAgIHQwICo9IHQwO1xyXG4gICAgZ2kwID0gdGhpcy5hUGVybVtpaSArIHRoaXMuYVBlcm1bamogKyB0aGlzLmFQZXJtW2trICsgdGhpcy5hUGVybVtsbF1dXV0lMzI7XHJcbiAgICBuMCA9IHQwKnQwKnRoaXMuZG90NCh0aGlzLmdyYWQ0W2dpMF0sIHgwLCB5MCwgejAsIHcwKTtcclxuICB9XHJcbiAgdDEgPSAwLjYgLSB4MSp4MSAtIHkxKnkxIC0gejEqejEgLSB3MSp3MTtcclxuICBpZiAodDE8MCkge1xyXG4gICAgbjEgPSAwOyBcclxuICB9IGVsc2UgeyBcclxuICAgIHQxICo9IHQxO1xyXG4gICAgZ2kxID0gdGhpcy5hUGVybVtpaSArIGkxICsgdGhpcy5hUGVybVtqaiArIGoxICsgdGhpcy5hUGVybVtrayArIGsxICsgdGhpcy5hUGVybVtsbCArIGwxXV1dXSUzMjtcclxuICAgIG4xID0gdDEqdDEqdGhpcy5kb3Q0KHRoaXMuZ3JhZDRbZ2kxXSwgeDEsIHkxLCB6MSwgdzEpO1xyXG4gIH1cclxuICB0MiA9IDAuNiAtIHgyKngyIC0geTIqeTIgLSB6Mip6MiAtIHcyKncyO1xyXG4gIGlmICh0MjwwKSB7XHJcbiAgICBuMiA9IDA7IFxyXG4gIH0gZWxzZSB7IFxyXG4gICAgdDIgKj0gdDI7XHJcbiAgICBnaTIgPSB0aGlzLmFQZXJtW2lpICsgaTIgKyB0aGlzLmFQZXJtW2pqICsgajIgKyB0aGlzLmFQZXJtW2trICsgazIgKyB0aGlzLmFQZXJtW2xsICsgbDJdXV1dJTMyO1xyXG4gICAgbjIgPSB0Mip0Mip0aGlzLmRvdDQodGhpcy5ncmFkNFtnaTJdLCB4MiwgeTIsIHoyLCB3Mik7XHJcbiAgfVxyXG4gIHQzID0gMC42IC0geDMqeDMgLSB5Myp5MyAtIHozKnozIC0gdzMqdzM7XHJcbiAgaWYgKHQzPDApIHtcclxuICAgIG4zID0gMDsgXHJcbiAgfSBlbHNlIHsgXHJcbiAgICB0MyAqPSB0MztcclxuICAgIGdpMyA9IHRoaXMuYVBlcm1baWkgKyBpMyArIHRoaXMuYVBlcm1bamogKyBqMyArIHRoaXMuYVBlcm1ba2sgKyBrMyArIHRoaXMuYVBlcm1bbGwgKyBsM11dXV0lMzI7XHJcbiAgICBuMyA9IHQzKnQzKnRoaXMuZG90NCh0aGlzLmdyYWQ0W2dpM10sIHgzLCB5MywgejMsIHczKTtcclxuICB9XHJcbiAgdDQgPSAwLjYgLSB4NCp4NCAtIHk0Knk0IC0gejQqejQgLSB3NCp3NDtcclxuICBpZiAodDQ8MCkge1xyXG4gICAgbjQgPSAwOyBcclxuICB9IGVsc2UgeyBcclxuICAgIHQ0ICo9IHQ0O1xyXG4gICAgZ2k0ID0gdGhpcy5hUGVybVtpaSArIDEgKyB0aGlzLmFQZXJtW2pqICsgMSArIHRoaXMuYVBlcm1ba2sgKyAxICsgdGhpcy5hUGVybVtsbCArIDFdXV1dJTMyO1xyXG4gICAgbjQgPSB0NCp0NCp0aGlzLmRvdDQodGhpcy5ncmFkNFtnaTRdLCB4NCwgeTQsIHo0LCB3NCk7XHJcbiAgfVxyXG4gIC8vIFN1bSB1cCBhbmQgc2NhbGUgdGhlIHJlc3VsdCB0byBjb3ZlciB0aGUgcmFuZ2UgWy0xLDFdXHJcbiAgcmV0dXJuIDI3LjAqKG4wICsgbjEgKyBuMiArIG4zICsgbjQpO1xyXG59O1xyXG5cclxuLy8gc2V0UGVybVxyXG5ub2lzZS5wcm90b3R5cGUuc2V0UGVybSA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdmFyIGk7XHJcbiAgdmFyIHAgPSBuZXcgc29tZS5BcnJheSggMjU2ICk7XHJcblxyXG4gIGZvciAoIGk9MDsgaTwyNTY7IGkrKyApIHsgXHJcbiAgICBwWyBpIF0gPSBNYXRoLmZsb29yKCB0aGlzLnJhbmRvbS51bmlmb3JtKCkgKiAyNTYgKTtcclxuICB9XHJcblxyXG4gIC8vIFRvIHJlbW92ZSB0aGUgbmVlZCBmb3IgaW5kZXggd3JhcHBpbmcsIGRvdWJsZSB0aGUgcGVybXV0YXRpb24gdGFibGUgbGVuZ3RoIFxyXG4gIHRoaXMuYVBlcm0gPSBuZXcgc29tZS5BcnJheSggNTEyICk7IFxyXG4gIGZvciAoIGk9MDsgaTw1MTI7IGkrKyApIHtcclxuICAgIHRoaXMuYVBlcm1bIGkgXSA9IHBbIGkgJiAyNTUgXTtcclxuICB9XHJcbn07XHJcblxyXG5ub2lzZS5wcm90b3R5cGUuc2V0U2VlZCA9IGZ1bmN0aW9uICggc2VlZCApIHtcclxuICB0aGlzLnJhbmRvbSA9IG5ldyBzb21lLnJhbmRvbSggc2VlZCApO1xyXG4gIHRoaXMuc2V0UGVybSgpO1xyXG59O1xyXG5cclxubm9pc2UucHJvdG90eXBlLm9jdEZyZXFQZXJzID0gZnVuY3Rpb24gKCApIHtcclxuICB2YXIgZkZyZXEsIGZQZXJzO1xyXG4gIHRoaXMuYU9jdEZyZXEgPSBuZXcgc29tZS5BcnJheSggdGhpcy5pT2N0YXZlcyApO1xyXG4gIHRoaXMuYU9jdFBlcnMgPSBuZXcgc29tZS5BcnJheSggdGhpcy5pT2N0YXZlcyApO1xyXG4gIHRoaXMuZlBlcnNNYXggPSAwO1xyXG4gIGZvciAoIHZhciBpID0gMDsgaSA8IHRoaXMuaU9jdGF2ZXM7IGkrKyApIHtcclxuICAgIGZGcmVxID0gTWF0aC5wb3coIDIsIGkgKTtcclxuICAgIGZQZXJzID0gTWF0aC5wb3coIHRoaXMuZlBlcnNpc3RlbmNlLCBpICk7XHJcbiAgICB0aGlzLmZQZXJzTWF4ICs9IGZQZXJzO1xyXG4gICAgdGhpcy5hT2N0RnJlcVsgaSBdID0gZkZyZXE7XHJcbiAgICB0aGlzLmFPY3RQZXJzWyBpIF0gPSBmUGVycztcclxuICB9XHJcbiAgdGhpcy5mUGVyc01heCA9IDEgLyB0aGlzLmZQZXJzTWF4O1xyXG59O1xyXG5cclxubm9pc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICggeCwgeSwgeiwgdyApIHtcclxuICB2YXIgZkZyZXEsIGZQZXJzLCBmUmVzdWx0O1xyXG4gIGZSZXN1bHQgPSAwO1xyXG4gIGZvciAoIHZhciBnID0gMDsgZyA8IHRoaXMuaU9jdGF2ZXM7IGcrKyApIHtcclxuICAgIGZGcmVxID0gdGhpcy5hT2N0RnJlcVsgZyBdO1xyXG4gICAgZlBlcnMgPSB0aGlzLmFPY3RQZXJzWyBnIF07XHJcbiAgICBzd2l0Y2ggKCBhcmd1bWVudHMubGVuZ3RoICkge1xyXG4gICAgICBjYXNlIDQ6ICBmUmVzdWx0ICs9IGZQZXJzICogdGhpcy5mb3VyZCggZkZyZXEgKiB4LCBmRnJlcSAqIHksIGZGcmVxICogeiwgZkZyZXEgKiB3ICk7IGJyZWFrO1xyXG4gICAgICBjYXNlIDM6ICBmUmVzdWx0ICs9IGZQZXJzICogdGhpcy50aHJlZWQoIGZGcmVxICogeCwgZkZyZXEgKiB5LCBmRnJlcSAqIHogKTsgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6IGZSZXN1bHQgKz0gZlBlcnMgKiB0aGlzLnR3b2QoIGZGcmVxICogeCwgZkZyZXEgKiB5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAoIGZSZXN1bHQgKiB0aGlzLmZQZXJzTWF4ICsgMSApICogMC41O1xyXG59O1xyXG5cclxubm9pc2UucHJvdG90eXBlLm5vaXNlRGV0YWlsID0gZnVuY3Rpb24gKCBvY3RhdmVzLCBmYWxsb2ZmICkge1xyXG4gIHRoaXMuaU9jdGF2ZXMgPSBvY3RhdmVzIHx8IHRoaXMuaU9jdGF2ZXM7XHJcbiAgdGhpcy5mUGVyc2lzdGVuY2UgPSBmYWxsb2ZmIHx8IHRoaXMuZlBlcnNpc3RlbmNlO1xyXG4gIHRoaXMub2N0RnJlcVBlcnMoKTtcclxufTtcclxuXHJcbm5vaXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICggKSB7XHJcbiAgcmV0dXJuIFwiW29iamVjdCBub2lzZSBcIiArIHRoaXMuaU9jdGF2ZXMgKyBcIiBcIiArIHRoaXMuZlBlcnNpc3RlbmNlICsgXCJdXCI7XHJcbn07XHJcblxyXG5zb21lLm5vaXNlID0gbm9pc2U7XHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbi8qKlxyXG4gKiBTZWVkYWJsZSByYW5kb20gbnVtYmVyIGdlbmVyYXRvciBmdW5jdGlvbnMuXHJcbiAqIEB2ZXJzaW9uIDEuMC4wXHJcbiAqIEBsaWNlbnNlIFB1YmxpYyBEb21haW5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogdmFyIHJuZyA9IG5ldyBSTkcoJ0V4YW1wbGUnKTtcclxuICogcm5nLnJhbmRvbSg0MCwgNTApOyAgLy8gPT4gIDQyXHJcbiAqIHJuZy51bmlmb3JtKCk7ICAgICAgIC8vID0+ICAwLjc5NzI3OTg5OTUwNTA5MDNcclxuICogcm5nLm5vcm1hbCgpOyAgICAgICAgLy8gPT4gLTAuNjY5ODUwNDU0MzIxNjM3NlxyXG4gKiBybmcuZXhwb25lbnRpYWwoKTsgICAvLyA9PiAgMS4wNTQ3MzY3NjA5MTMxNTU1XHJcbiAqIHJuZy5wb2lzc29uKDQpOyAgICAgIC8vID0+ICAyXHJcbiAqIHJuZy5nYW1tYSg0KTsgICAgICAgIC8vID0+ICAyLjc4MTcyNDY4NzM4Njg1OFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VlZCBBIHN0cmluZyB0byBzZWVkIHRoZSBnZW5lcmF0b3IuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxudmFyIFJDNCA9IGZ1bmN0aW9uICggc2VlZCApIHtcclxuICB0aGlzLnMgPSBuZXcgc29tZS5BcnJheSggMjU2ICk7XHJcbiAgdGhpcy5pID0gMDtcclxuICB0aGlzLmogPSAwO1xyXG5cclxuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCAyNTY7IGkrKyApIHtcclxuICAgIHRoaXMuc1sgaSBdID0gaTtcclxuICB9XHJcblxyXG4gIGlmICggc2VlZCApIHtcclxuICAgIHRoaXMubWl4KCBzZWVkICk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgdW5kZXJseWluZyBieXRlcyBvZiBhIHN0cmluZy5cclxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7QXJyYXl9IEFuIGFycmF5IG9mIGJ5dGVzXHJcbiAqL1xyXG5SQzQuZ2V0U3RyaW5nQnl0ZXMgPSBmdW5jdGlvbiggc3RyaW5nICkge1xyXG4gIHZhciBvdXRwdXQgPSBbIF07XHJcbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrICkge1xyXG4gICAgdmFyIGMgPSBzdHJpbmcuY2hhckNvZGVBdCggaSApO1xyXG4gICAgdmFyIGJ5dGVzID0gWyBdO1xyXG4gICAgZG8ge1xyXG4gICAgICBieXRlcy5wdXNoKCBjICYgMHhGRiApO1xyXG4gICAgICBjID0gYyA+PiA4O1xyXG4gICAgfSB3aGlsZSAoIGMgPiAwICk7XHJcbiAgICBvdXRwdXQgPSBvdXRwdXQuY29uY2F0KCBieXRlcy5yZXZlcnNlKCApICk7XHJcbiAgfVxyXG4gIHJldHVybiBvdXRwdXQ7XHJcbn07XHJcblxyXG5SQzQucHJvdG90eXBlLl9zd2FwID0gZnVuY3Rpb24oIGksIGogKSB7XHJcbiAgdmFyIHRtcCA9IHRoaXMuc1sgaSBdO1xyXG4gIHRoaXMuc1sgaSBdID0gdGhpcy5zWyBqIF07XHJcbiAgdGhpcy5zWyBqIF0gPSB0bXA7XHJcbn07XHJcblxyXG4vKipcclxuICogTWl4IGFkZGl0aW9uYWwgZW50cm9weSBpbnRvIHRoaXMgZ2VuZXJhdG9yLlxyXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VlZFxyXG4gKi9cclxuUkM0LnByb3RvdHlwZS5taXggPSBmdW5jdGlvbiggc2VlZCApIHtcclxuICB2YXIgaW5wdXQgPSBSQzQuZ2V0U3RyaW5nQnl0ZXMoIHNlZWQgKTtcclxuICB2YXIgaiA9IDA7XHJcbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgaiArPSB0aGlzLnNbIGkgXSArIGlucHV0WyBpICUgaW5wdXQubGVuZ3RoIF07XHJcbiAgICBqICU9IDI1NjtcclxuICAgIHRoaXMuX3N3YXAoIGksIGogKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQHJldHVybnMge251bWJlcn0gVGhlIG5leHQgYnl0ZSBvZiBvdXRwdXQgZnJvbSB0aGUgZ2VuZXJhdG9yLlxyXG4gKi9cclxuUkM0LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5pID0gKCB0aGlzLmkgKyAxICkgJSAyNTY7XHJcbiAgdGhpcy5qID0gKCB0aGlzLmogKyB0aGlzLnNbIHRoaXMuaSBdICkgJSAyNTY7XHJcbiAgdGhpcy5fc3dhcCggdGhpcy5pLCB0aGlzLmogKTtcclxuICByZXR1cm4gdGhpcy5zWyAoIHRoaXMuc1sgdGhpcy5pIF0gKyB0aGlzLnNbIHRoaXMuaiBdICkgJSAyNTYgXTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIHdpdGggb3B0aW9uYWwgc2VlZC4gSWYgdGhlXHJcbiAqIHByb3ZpZGVkIHNlZWQgaXMgYSBmdW5jdGlvbiAoaS5lLiBNYXRoLnJhbmRvbSkgaXQgd2lsbCBiZSB1c2VkIGFzXHJcbiAqIHRoZSB1bmlmb3JtIG51bWJlciBnZW5lcmF0b3IuXHJcbiAqIEBwYXJhbSBzZWVkIEFuIGFyYml0cmFyeSBvYmplY3QgdXNlZCB0byBzZWVkIHRoZSBnZW5lcmF0b3IuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxudmFyIHJhbmRvbSA9IGZ1bmN0aW9uICggc2VlZCApIHtcclxuICBpZiAoIHR5cGVvZiBzZWVkID09PSBcInVuZGVmaW5lZFwiICkge1xyXG4gICAgc2VlZCA9ICcnICsgTWF0aC5yYW5kb20oICkgKyBEYXRlLm5vdyggKTtcclxuICB9IFxyXG4gIGVsc2UgaWYgKCB0eXBlb2Ygc2VlZCA9PT0gXCJmdW5jdGlvblwiICkge1xyXG4gICAgLy8gVXNlIGl0IGFzIGEgdW5pZm9ybSBudW1iZXIgZ2VuZXJhdG9yXHJcbiAgICB0aGlzLnVuaWZvcm0gPSBzZWVkO1xyXG4gICAgdGhpcy5uZXh0Qnl0ZSA9IGZ1bmN0aW9uICggKSB7XHJcbiAgICAgIHJldHVybiB+figgdGhpcy51bmlmb3JtKCkgKiAyNTYgKTtcclxuICAgIH07XHJcbiAgICBzZWVkID0gbnVsbDtcclxuICB9IFxyXG4gIGVsc2UgaWYgKCBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoIHNlZWQgKSAhPT0gXCJbb2JqZWN0IFN0cmluZ11cIiApIHtcclxuICAgIHNlZWQgPSBKU09OLnN0cmluZ2lmeSggc2VlZCApO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fbm9ybWFsID0gbnVsbDtcclxuXHJcbiAgaWYgKCBzZWVkICkge1xyXG4gICAgdGhpcy5fc3RhdGUgPSBuZXcgUkM0KCBzZWVkICk7XHJcbiAgfSBcclxuICBlbHNlIHtcclxuICAgIHRoaXMuX3N0YXRlID0gbnVsbDtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQHJldHVybnMge251bWJlcn0gVW5pZm9ybSByYW5kb20gbnVtYmVyIGJldHdlZW4gMCBhbmQgMjU1LlxyXG4gKi9cclxucmFuZG9tLnByb3RvdHlwZS5uZXh0Qnl0ZSA9IGZ1bmN0aW9uICggKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc3RhdGUubmV4dCggKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBVbmlmb3JtIHJhbmRvbSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxLlxyXG4gKi9cclxucmFuZG9tLnByb3RvdHlwZS51bmlmb3JtID0gZnVuY3Rpb24gKCApIHtcclxuICAgIHZhciBCWVRFUyA9IDc7IC8vIDU2IGJpdHMgdG8gbWFrZSBhIDUzLWJpdCBkb3VibGVcclxuICAgIHZhciBvdXRwdXQgPSAwO1xyXG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgQllURVM7IGkrKyApIHtcclxuICAgICAgICBvdXRwdXQgKj0gMjU2O1xyXG4gICAgICAgIG91dHB1dCArPSB0aGlzLm5leHRCeXRlKCApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG91dHB1dCAvICggTWF0aC5wb3coIDIsIEJZVEVTICogOCApIC0gMSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByb2R1Y2UgYSByYW5kb20gaW50ZWdlciB3aXRoaW4gW24sIG0pLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW249MF1cclxuICogQHBhcmFtIHtudW1iZXJ9IG1cclxuICpcclxuICovXHJcbnJhbmRvbS5wcm90b3R5cGUucmFuZG9tID0gZnVuY3Rpb24oIG4sIG0gKSB7XHJcbiAgICBpZiAoIHR5cGVvZiBuID09PSBcInVuZGVmaW5lZFwiICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVuaWZvcm0oICk7XHJcbiAgICB9IFxyXG4gICAgZWxzZSBpZiAoIHR5cGVvZiBtID09PSBcInVuZGVmaW5lZFwiICkge1xyXG4gICAgICAgIG0gPSBuO1xyXG4gICAgICAgIG4gPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuICsgTWF0aC5mbG9vciggdGhpcy51bmlmb3JtKCApICogKCBtIC0gbiApICk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIG51bWJlcnMgdXNpbmcgdGhpcy51bmlmb3JtKCkgd2l0aCB0aGUgQm94LU11bGxlciB0cmFuc2Zvcm0uXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IE5vcm1hbGx5LWRpc3RyaWJ1dGVkIHJhbmRvbSBudW1iZXIgb2YgbWVhbiAwLCB2YXJpYW5jZSAxLlxyXG4gKi9cclxucmFuZG9tLnByb3RvdHlwZS5ub3JtYWwgPSBmdW5jdGlvbiggKSB7XHJcbiAgICBpZiAoIHRoaXMuX25vcm1hbCAhPT0gbnVsbCApIHtcclxuICAgICAgICB2YXIgbiA9IHRoaXMuX25vcm1hbDtcclxuICAgICAgICB0aGlzLl9ub3JtYWwgPSBudWxsO1xyXG4gICAgICAgIHJldHVybiBuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMudW5pZm9ybSggKSB8fCBNYXRoLnBvdyggMiwgLTUzICk7IC8vIGNhbid0IGJlIGV4YWN0bHkgMFxyXG4gICAgICAgIHZhciB5ID0gdGhpcy51bmlmb3JtKCApO1xyXG4gICAgICAgIHRoaXMuX25vcm1hbCA9IE1hdGguc3FydCggLTIgKiBNYXRoLmxvZyggeCApICkgKiBNYXRoLnNpbiggMiAqIE1hdGguUEkgKiB5ICk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguc3FydCggLTIgKiBNYXRoLmxvZyggeCApICkgKiBNYXRoLmNvcyggMiAqIE1hdGguUEkgKiB5ICk7XHJcbiAgICB9XHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGVzIG51bWJlcnMgdXNpbmcgdGhpcy51bmlmb3JtKCkuXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IE51bWJlciBmcm9tIHRoZSBleHBvbmVudGlhbCBkaXN0cmlidXRpb24sIGxhbWJkYSA9IDEuXHJcbiAqL1xyXG5yYW5kb20ucHJvdG90eXBlLmV4cG9uZW50aWFsID0gZnVuY3Rpb24oICkge1xyXG4gICAgcmV0dXJuIC1NYXRoLmxvZyggdGhpcy51bmlmb3JtKCApIHx8IE1hdGgucG93KCAyLCAtNTMgKSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBudW1iZXJzIHVzaW5nIHRoaXMudW5pZm9ybSgpIGFuZCBLbnV0aCdzIG1ldGhvZC5cclxuICogQHBhcmFtIHtudW1iZXJ9IFttZWFuPTFdXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IE51bWJlciBmcm9tIHRoZSBQb2lzc29uIGRpc3RyaWJ1dGlvbi5cclxuICovXHJcbnJhbmRvbS5wcm90b3R5cGUucG9pc3NvbiA9IGZ1bmN0aW9uKCBtZWFuICkge1xyXG4gICAgdmFyIEwgPSBNYXRoLmV4cCggLSAoIG1lYW4gfHwgMSApICk7XHJcbiAgICB2YXIgayA9IDAsIHAgPSAxO1xyXG4gICAgZG8ge1xyXG4gICAgICAgIGsrKztcclxuICAgICAgICBwICo9IHRoaXMudW5pZm9ybSggKTtcclxuICAgIH0gd2hpbGUgKCBwID4gTCApO1xyXG4gICAgcmV0dXJuIGsgLSAxO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyBudW1iZXJzIHVzaW5nIHRoaXMudW5pZm9ybSgpLCB0aGlzLm5vcm1hbCgpLFxyXG4gKiB0aGlzLmV4cG9uZW50aWFsKCksIGFuZCB0aGUgTWFyc2FnbGlhLVRzYW5nIG1ldGhvZC5cclxuICogQHBhcmFtIHtudW1iZXJ9IGFcclxuICogQHJldHVybnMge251bWJlcn0gTnVtYmVyIGZyb20gdGhlIGdhbW1hIGRpc3RyaWJ1dGlvbi5cclxuICovXHJcbnJhbmRvbS5wcm90b3R5cGUuZ2FtbWEgPSBmdW5jdGlvbiggYSApIHtcclxuICB2YXIgdiwgeCwgdSwgeDI7XHJcbiAgdmFyIGQgPSAoIGEgPCAxID8gMSArIGEgOiBhICkgLSAxIC8gMztcclxuICB2YXIgYyA9IDEgLyBNYXRoLnNxcnQoIDkgKiBkICk7XHJcbiAgZG8ge1xyXG4gICAgICBkbyB7XHJcbiAgICAgICAgICB4ID0gdGhpcy5ub3JtYWwoICk7XHJcbiAgICAgICAgICB2ID0gTWF0aC5wb3coIGMgKiB4ICsgMSwgMyApO1xyXG4gICAgICB9IHdoaWxlICggdiA8PSAwICk7XHJcbiAgICAgIHUgPSB0aGlzLnVuaWZvcm0oICk7XHJcbiAgICAgIHgyID0gTWF0aC5wb3coIHgsIDIgKTtcclxuICB9IHdoaWxlICggdSA+PSAxIC0gMC4wMzMxICogeDIgKiB4MiAmJlxyXG4gICAgICAgICAgIE1hdGgubG9nKCB1ICkgPj0gMC41ICogeDIgKyBkICogKCAxIC0gdiArIE1hdGgubG9nKCB2ICkgKSApO1xyXG4gIGlmICggYSA8IDEgKSB7XHJcbiAgICAgIHJldHVybiBkICogdiAqIE1hdGguZXhwKCB0aGlzLmV4cG9uZW50aWFsKCApIC8gLWEgKTtcclxuICB9IFxyXG4gIGVsc2Uge1xyXG4gICAgICByZXR1cm4gZCAqIHY7XHJcbiAgfVxyXG59O1xyXG5cclxuc29tZS5yYW5kb20gPSByYW5kb207XHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbnZhciBzaGFwZSA9IGZ1bmN0aW9uICggd29ybGQsIHNoYXBlQmV6aWVycywgc2hhcGVTaXplICkge1xyXG4gIHNvbWUuZHJhd2FibGUuY2FsbCggdGhpcywgd29ybGQgKTtcclxuXHJcbiAgdGhpcy5zaGFwZSA9IFsgXTtcclxuICB0aGlzLmMxID0gWyBdO1xyXG4gIHRoaXMuYzIgPSBbIF07XHJcbiAgdGhpcy5zaGFwZVNpemUgPSBzaGFwZUJlemllcnMubGVuZ3RoO1xyXG5cclxuICBpZiAoIHNoYXBlU2l6ZSBpbnN0YW5jZW9mIHNvbWUudmVjMiApIHtcclxuICAgIHRoaXMuc2l6ZU9yaWdpbmFsID0gc2hhcGVTaXplO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIHNvbWUudmVjMi5zZXQoIHNoYXBlU2l6ZS5zaGlmdCgpLCBzaGFwZVNpemUuc2hpZnQoKSwgdGhpcy5zaXplT3JpZ2luYWwgKTtcclxuICB9XHJcblxyXG4gIHRoaXMuc2hhcGVTaXplID0gTWF0aC5mbG9vciggdGhpcy5zaGFwZVNpemUgLyA2ICk7XHJcblxyXG4gIHRoaXMuc2hhcGUucHVzaCggc29tZS52ZWMyLmNyZWF0ZSggc2hhcGVCZXppZXJzLnNoaWZ0KCksIHNoYXBlQmV6aWVycy5zaGlmdCgpICkgKTtcclxuXHJcbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVNpemU7IGkrKyApIHtcclxuICAgIHRoaXMuYzEucHVzaCggc29tZS52ZWMyLmNyZWF0ZSggc2hhcGVCZXppZXJzLnNoaWZ0KCksIHNoYXBlQmV6aWVycy5zaGlmdCgpICkgKTtcclxuICAgIHRoaXMuYzIucHVzaCggc29tZS52ZWMyLmNyZWF0ZSggc2hhcGVCZXppZXJzLnNoaWZ0KCksIHNoYXBlQmV6aWVycy5zaGlmdCgpICkgKTtcclxuICAgIHRoaXMuc2hhcGUucHVzaCggc29tZS52ZWMyLmNyZWF0ZSggc2hhcGVCZXppZXJzLnNoaWZ0KCksIHNoYXBlQmV6aWVycy5zaGlmdCgpICkgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuc2hhcGUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggc29tZS5kcmF3YWJsZS5wcm90b3R5cGUgKTtcclxuXHJcbnNoYXBlLnByb3RvdHlwZS5yZXByZXNlbnRhdGlvbiA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdGhpcy53b3JsZC5iZWdpblNoYXBlKCApO1xyXG4gICAgdGhpcy53b3JsZC52ZXJ0ZXgoIHRoaXMuc2hhcGVbIDAgXVsgMCBdLCB0aGlzLnNoYXBlWyAwIF1bIDEgXSApO1xyXG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5zaGFwZVNpemU7IGkrKyApIHtcclxuICAgICAgdGhpcy53b3JsZC5iZXppZXJWZXJ0ZXgoXHJcbiAgICAgICAgdGhpcy5jMVsgaSBdWyAwIF0sIHRoaXMuYzFbIGkgXVsgMSBdLCBcclxuICAgICAgICB0aGlzLmMyWyBpIF1bIDAgXSwgdGhpcy5jMlsgaSBdWyAxIF0sIFxyXG4gICAgICAgIHRoaXMuc2hhcGVbIGkgKyAxIF1bIDAgXSwgdGhpcy5zaGFwZVsgaSArIDEgXVsgMSBdXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgdGhpcy53b3JsZC5lbmRTaGFwZSggKTtcclxufTtcclxuXHJcbnNvbWUuc2hhcGUgPSBzaGFwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgc29tZSA9IHJlcXVpcmUoICcuL3NvbWUuY29yZScgKTtcclxuXHJcbnZhciBzcGluZSA9IGZ1bmN0aW9uICggd29ybGQsIHNoYXBlQmV6aWVycywgc2hhcGVBeGlzLCBzdGVwcywgcHJlY2lzaW9uICkge1xyXG4gIHNvbWUubGF5b3V0LmNhbGwoIHRoaXMsIHdvcmxkLCB0cnVlICk7XHJcbiAgc29tZS5zaGFwZS5jYWxsKCB0aGlzLCB3b3JsZCwgc2hhcGVCZXppZXJzLCBzaGFwZUF4aXMgKTtcclxuXHJcbiAgdGhpcy5zaGFwZUxlbmd0aCA9IFsgXTtcclxuICB0aGlzLnNoYXBlUG9pbnRzID0gWyBdO1xyXG5cclxuICB0aGlzLnNoYXBlVG90YWxMZW5ndGggPSAwLjA7XHJcblxyXG4gIHRoaXMuaW5pdCggcHJlY2lzaW9uICk7XHJcbiAgdGhpcy5nZW5lcmF0ZSggc3RlcHMgKTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5zcGluZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBzb21lLmxheW91dC5wcm90b3R5cGUgKTtcclxuXHJcbnNwaW5lLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oIHByZWNpc2lvbiApIHtcclxuICB2YXIgc3RlcCwgeCwgeSwgbGFzdFgsIGxhc3RZLCBkaXN0O1xyXG4gIFxyXG4gIHZhciB0ZW1wID0gc29tZS52ZWMyLmNyZWF0ZSgpO1xyXG5cclxuICBwcmVjaXNpb24gPSBwcmVjaXNpb24gfHwgNzA7XHJcblxyXG4gIGZvciAoIHZhciBpID0gMDsgaSA8IHRoaXMuc2hhcGVTaXplOyBpKysgKSB7XHJcbiAgICBzb21lLnZlYzIuY29weSggdGhpcy5zaGFwZVsgaSArIDEgXSwgdGVtcCApO1xyXG4gICAgdGhpcy5zaGFwZUxlbmd0aFsgaSBdID0gMDtcclxuICAgIHRoaXMuc2hhcGVQb2ludHNbIGkgXSA9IHsgfTtcclxuICAgIHRoaXMuc2hhcGVQb2ludHNbIGkgXS50ID0gWyBdO1xyXG4gICAgdGhpcy5zaGFwZVBvaW50c1sgaSBdLnMgPSBbIF07XHJcblxyXG4gICAgc29tZS52ZWMyLnN1YiggdGVtcCwgdGhpcy5zaGFwZVsgaSBdLCB0ZW1wICk7XHJcbiAgICBzdGVwID0gMSAvICggTWF0aC5mbG9vciggKCBzb21lLnZlYzIubGVuKCB0ZW1wICkgLyAyNSApICogcHJlY2lzaW9uICkgKyAxICk7XHJcblxyXG4gICAgbGFzdFggPSB0aGlzLnNoYXBlWyBpIF1bIDAgXTtcclxuICAgIGxhc3RZID0gdGhpcy5zaGFwZVsgaSBdWyAxIF07XHJcbiAgICBmb3IgKCB2YXIgdCA9IDA7IHQgPD0gMTsgdCArPSBzdGVwICkge1xyXG4gICAgICB4ID0gdGhpcy53b3JsZC5iZXppZXJQb2ludCggXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgaSBdWyAwIF0sIFxyXG4gICAgICAgIHRoaXMuYzFbIGkgXVsgMCBdLCBcclxuICAgICAgICB0aGlzLmMyWyBpIF1bIDAgXSwgXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgaSArIDEgXVsgMCBdLCBcclxuICAgICAgICB0IFxyXG4gICAgICApO1xyXG4gICAgICB5ID0gdGhpcy53b3JsZC5iZXppZXJQb2ludCggXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgaSBdWyAxIF0sIFxyXG4gICAgICAgIHRoaXMuYzFbIGkgXVsgMSBdLCBcclxuICAgICAgICB0aGlzLmMyWyBpIF1bIDEgXSwgXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgaSArIDEgXVsgMSBdLCBcclxuICAgICAgICB0IFxyXG4gICAgICApO1xyXG4gICAgICAvL0NhbGN1bGFyIGEgZGlzdGFuY2lhIGVudHJlIGVzc2UgcG9udG8gZSBvIHVsdGltb1xyXG4gICAgICBkaXN0ID0gTWF0aC5zcXJ0KCAoICggeCAtIGxhc3RYICkgKiAoIHggLSBsYXN0WCApICkgKyAoICggeSAtIGxhc3RZICkgKiAoIHkgLSBsYXN0WSApICkgKTtcclxuXHJcbiAgICAgIHRoaXMuc2hhcGVMZW5ndGhbIGkgXSArPSBkaXN0O1xyXG4gICAgICB0aGlzLnNoYXBlUG9pbnRzWyBpIF0ucy5wdXNoKCB0aGlzLnNoYXBlTGVuZ3RoWyBpIF0gKTtcclxuICAgICAgdGhpcy5zaGFwZVBvaW50c1sgaSBdLnQucHVzaCggdCApO1xyXG5cclxuICAgICAgbGFzdFggPSB4O1xyXG4gICAgICBsYXN0WSA9IHk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zaGFwZVRvdGFsTGVuZ3RoICs9IHRoaXMuc2hhcGVMZW5ndGhbIGkgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuc3BpbmUucHJvdG90eXBlLl9maW5kQ2xvc2VzdFQgPSBmdW5jdGlvbiAoIHNoYXBlLCBzICkge1xyXG4gIHZhciBwb2ludHMgPSB0aGlzLnNoYXBlUG9pbnRzWyBzaGFwZSBdO1xyXG4gIHZhciBpLCBsLCBjdXJyO1xyXG5cclxuICBpZiAoIHBvaW50cy5zWyAwIF0gPj0gcyApIHtcclxuICAgIHJldHVybiBwb2ludHMudFsgMCBdO1xyXG4gIH0gXHJcblxyXG4gIGZvciAoIGkgPSAwLCBsID0gcG9pbnRzLnMubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xyXG4gICAgaWYgKCBwb2ludHMuc1sgaSBdID4gcyApIHtcclxuICAgICAgaWYgKCAoIHBvaW50cy5zWyBpIF0gLSBzICkgPiAoIHMgLSBwb2ludHMuc1sgaSAtIDEgXSApICkge1xyXG4gICAgICAgIGN1cnIgPSBwb2ludHMudFsgaSAtIDEgXTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfSBcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY3VyciA9IHBvaW50cy50WyBpIF07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmICggaSA9PT0gbCApIHtcclxuICAgIHJldHVybiBwb2ludHMudFsgaSAtIDEgXTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4gY3VycjtcclxuICB9XHJcbn07XHJcblxyXG5zcGluZS5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoIHN0ZXBzICkge1xyXG4gIHZhciBwcm9ncmVzcyA9IDAsIFxyXG4gICAgICBzaGFwZVByb2dyZXNzID0gMC4wMDEsXHJcbiAgICAgIHNoYXBlU3RlcCA9IDAsXHJcbiAgICAgIHN0ZXAsIHQsIHM7XHJcblxyXG4gIHRoaXMuaW5pdEFycmF5cyggc3RlcHMgfHwgdGhpcy5zdGVwcyApO1xyXG5cclxuICBzdGVwID0gdGhpcy5zaGFwZVRvdGFsTGVuZ3RoIC8gdGhpcy5zdGVwcztcclxuICBcclxuICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuc3RlcHM7IGkrKywgc2hhcGVQcm9ncmVzcyArPSBzdGVwICkge1xyXG4gICAgaWYgKCAoIHNoYXBlUHJvZ3Jlc3MgLSBwcm9ncmVzcyApID4gdGhpcy5zaGFwZUxlbmd0aFsgc2hhcGVTdGVwIF0gKSB7XHJcbiAgICAgIHByb2dyZXNzICs9IHRoaXMuc2hhcGVMZW5ndGhbIHNoYXBlU3RlcCBdO1xyXG4gICAgICBzaGFwZVN0ZXArKztcclxuICAgICAgaWYgKCBzaGFwZVN0ZXAgPT09IHRoaXMuc2hhcGVTaXplICkge1xyXG4gICAgICAgIHNoYXBlU3RlcCA9IDA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICAgXHJcbiAgICBzID0gc2hhcGVQcm9ncmVzcyAtIHByb2dyZXNzO1xyXG4gICAgdCA9IHRoaXMuX2ZpbmRDbG9zZXN0VCggc2hhcGVTdGVwLCBzICk7Ly9sb29rdXAgdGhpcy5zaGFwZVBvaW50cztcclxuXHJcbiAgICAvL2Jvb20gbmV3IHZlcnRcclxuICAgIHRoaXMuZnJvbVZlcnRzWyBpIF0gPSBzb21lLnZlYzIuY3JlYXRlKCBcclxuICAgICAgdGhpcy53b3JsZC5iZXppZXJQb2ludCggXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgc2hhcGVTdGVwIF1bIDAgXSwgXHJcbiAgICAgICAgdGhpcy5jMVsgc2hhcGVTdGVwIF1bIDAgXSwgXHJcbiAgICAgICAgdGhpcy5jMlsgc2hhcGVTdGVwIF1bIDAgXSwgXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgc2hhcGVTdGVwICsgMSBdWyAwIF0sXHJcbiAgICAgICAgdCApLCBcclxuICAgICAgdGhpcy53b3JsZC5iZXppZXJQb2ludCggXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgc2hhcGVTdGVwIF1bIDEgXSwgXHJcbiAgICAgICAgdGhpcy5jMVsgc2hhcGVTdGVwIF1bIDEgXSwgXHJcbiAgICAgICAgdGhpcy5jMlsgc2hhcGVTdGVwIF1bIDEgXSwgXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgc2hhcGVTdGVwICsgMSBdWyAxIF0sIFxyXG4gICAgICAgIHQgKSBcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy50b1ZlcnRzWyBpIF0gPSBzb21lLnZlYzIuY3JlYXRlKFxyXG4gICAgICB0aGlzLndvcmxkLmJlemllclRhbmdlbnQoIFxyXG4gICAgICAgIHRoaXMuc2hhcGVbIHNoYXBlU3RlcCBdWyAwIF0sIFxyXG4gICAgICAgIHRoaXMuYzFbIHNoYXBlU3RlcCBdWyAwIF0sIFxyXG4gICAgICAgIHRoaXMuYzJbIHNoYXBlU3RlcCBdWyAwIF0sIFxyXG4gICAgICAgIHRoaXMuc2hhcGVbIHNoYXBlU3RlcCArIDEgXVsgMCBdLFxyXG4gICAgICAgIHQgKSwgXHJcbiAgICAgIHRoaXMud29ybGQuYmV6aWVyVGFuZ2VudCggXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgc2hhcGVTdGVwIF1bIDEgXSwgXHJcbiAgICAgICAgdGhpcy5jMVsgc2hhcGVTdGVwIF1bIDEgXSwgXHJcbiAgICAgICAgdGhpcy5jMlsgc2hhcGVTdGVwIF1bIDEgXSwgXHJcbiAgICAgICAgdGhpcy5zaGFwZVsgc2hhcGVTdGVwICsgMSBdWyAxIF0sIFxyXG4gICAgICAgIHQgKVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLm9yaWdpblZlcnRzWyBpIF0gPSBzb21lLnZlYzIuY2xvbmUoIHRoaXMuZnJvbVZlcnRzWyBpIF0gKTtcclxuICAgIHRoaXMub3JpZ2luSGVhZGluZ3NbIGkgXSA9IHNvbWUudmVjMi5oZWFkaW5nKCB0aGlzLnRvVmVydHNbIGkgXSApO1xyXG5cclxuICAgIHNvbWUudmVjMi5ub3JtYWxpemUoIHRoaXMudG9WZXJ0c1sgaSBdLCB0aGlzLnRvVmVydHNbIGkgXSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG5zb21lLnNwaW5lID0gc3BpbmU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNvbWU7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIHNvbWUgPSByZXF1aXJlKCAnLi9zb21lLmNvcmUnICk7XHJcblxyXG4vKipcclxuICogdmVjIDIgXHJcbiAqIGJhc2VkIG9uIHA1LmpzLCBnbC1NYXRyaXguanMgYW5kIGh0dHA6Ly9tZWRpYS50b2ppY29kZS5jb20vc2Zqcy12ZWN0b3JzL1xyXG4gKlxyXG4gKiBPYmplY3RzIGZvciBsYXJnZSBudW1iZXIgb2YgdmVjdG9ycyAoIGNsYXNzIClcclxuICogVHlwZWQgQXJyYXlzIGZvciByZXVzZSAoIHN0YXRpYyApXHJcbiAqL1xyXG5cclxudmFyIHZlYzIgPSBmdW5jdGlvbiAoIHgsIHkgKSB7XHJcbiAgdGhpcy54ID0geDtcclxuICB0aGlzLnkgPSB5O1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbnZlYzIuY3JlYXRlID0gZnVuY3Rpb24oIGEsIGIgKSB7XHJcbiAgdmFyIG91dCA9IG5ldyBzb21lLkFycmF5KCAyICk7XHJcbiAgb3V0WyAwIF0gPSBhIHx8IDA7XHJcbiAgb3V0WyAxIF0gPSBiIHx8IDA7XHJcblxyXG4gIHJldHVybiBvdXQ7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIGNsb25lXHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICggKSB7XHJcbiAgcmV0dXJuIG5ldyB2ZWMyKCB0aGlzLngsIHRoaXMueSApO1xyXG59O1xyXG5cclxudmVjMi5jbG9uZSA9IGZ1bmN0aW9uKCBhICkge1xyXG4gIHZhciBvdXQgPSBuZXcgc29tZS5BcnJheSggMiApO1xyXG4gIG91dFsgMCBdID0gYVsgMCBdO1xyXG4gIG91dFsgMSBdID0gYVsgMSBdO1xyXG5cclxuICByZXR1cm4gb3V0O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBjb3B5XHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKCB2ICkge1xyXG4gIHRoaXMueCA9IHYueDtcclxuICB0aGlzLnkgPSB2Lnk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxudmVjMi5jb3B5ID0gZnVuY3Rpb24gKCBhLCBvdXQgKSB7XHJcbiAgb3V0WyAwIF0gPSBhWyAwIF07XHJcbiAgb3V0WyAxIF0gPSBhWyAxIF07XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIHNldFxyXG4gKi9cclxudmVjMi5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKCB4LCB5ICkge1xyXG4gIHRoaXMueCA9IHggfHwgMDtcclxuICB0aGlzLnkgPSB5IHx8IDA7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxudmVjMi5zZXQgPSBmdW5jdGlvbiggYSwgYiwgb3V0ICkge1xyXG4gIG91dFsgMCBdID0gYTtcclxuICBvdXRbIDEgXSA9IGI7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIGxlblxyXG4gKi9cclxudmVjMi5wcm90b3R5cGUubGVuID0gZnVuY3Rpb24gKCApIHtcclxuICB2YXIgeCA9IHRoaXMueCxcclxuICAgICAgeSA9IHRoaXMueTtcclxuICByZXR1cm4gTWF0aC5zcXJ0KCB4ICogeCArIHkgKiB5ICk7XHJcbn07XHJcblxyXG52ZWMyLmxlbiA9IGZ1bmN0aW9uICggYSApIHtcclxuICB2YXIgeCA9IGFbIDAgXSxcclxuICAgICAgeSA9IGFbIDEgXTtcclxuICByZXR1cm4gTWF0aC5zcXJ0KCB4ICogeCArIHkgKiB5ICk7XHJcbn07XHJcblxyXG4vKipcclxuICogc2V0TGVuXHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5zZXRMZW4gPSBmdW5jdGlvbiAoIGxlbiApIHtcclxuICByZXR1cm4gdGhpcy5ub3JtYWxpemUoICkubXVsdCggbGVuICk7XHJcbn07XHJcblxyXG52ZWMyLnNldExlbiA9IGZ1bmN0aW9uICggYSwgYiwgb3V0ICkge1xyXG4gIHZlYzIubm9ybWFsaXplKCBhLCBvdXQgKTtcclxuICB2ZWMyLnNjYWxlKCBvdXQsIGIsIG91dCApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIG5vcm1hbGl6ZVxyXG4gKi9cclxudmVjMi5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24gKCApIHtcclxuICB2YXIgbGVuID0gdGhpcy5sZW4oICk7XHJcbiAgaWYgKCBsZW4gPiAwICkge1xyXG4gICAgbGVuID0gMSAvIGxlbjtcclxuICAgIHRoaXMueCAqPSBsZW47XHJcbiAgICB0aGlzLnkgKj0gbGVuO1xyXG4gIH1cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbnZlYzIubm9ybWFsaXplID0gZnVuY3Rpb24oIGEsIG91dCApIHtcclxuICAgIHZhciBsZW4gPSB2ZWMyLmxlbiggYSApO1xyXG4gICAgaWYgKCBsZW4gPiAwICkge1xyXG4gICAgICAgIGxlbiA9IDEgLyBsZW47XHJcbiAgICAgICAgb3V0WyAwIF0gPSBhWyAwIF0gKiBsZW47XHJcbiAgICAgICAgb3V0WyAxIF0gPSBhWyAxIF0gKiBsZW47XHJcbiAgICB9XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIGFkZFxyXG4gKi9cclxudmVjMi5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKCB2ICkge1xyXG4gIHRoaXMueCArPSB2Lng7XHJcbiAgdGhpcy55ICs9IHYueTtcclxuXHJcbiAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG52ZWMyLmFkZCA9IGZ1bmN0aW9uICggYSwgYiwgb3V0ICkge1xyXG4gIG91dFsgMCBdID0gYVsgMCBdICsgYlsgMCBdO1xyXG4gIG91dFsgMSBdID0gYVsgMSBdICsgYlsgMSBdO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBzdWJ0cmFjdFxyXG4gKi9cclxudmVjMi5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiAoIHYgKSB7XHJcbiAgdGhpcy54IC09IHYueDtcclxuICB0aGlzLnkgLT0gdi55O1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbnZlYzIuc3VidHJhY3QgPSBmdW5jdGlvbiAoIGEsIGIsIG91dCApIHtcclxuICBvdXRbIDAgXSA9IGFbIDAgXSAtIGJbIDAgXTtcclxuICBvdXRbIDEgXSA9IGFbIDEgXSAtIGJbIDEgXTtcclxufTtcclxuXHJcbi8vIGFsaWFzZXNcclxudmVjMi5wcm90b3R5cGUuc3ViID0gdmVjMi5wcm90b3R5cGUuc3VidHJhY3Q7XHJcbnZlYzIuc3ViID0gdmVjMi5zdWJ0cmFjdDtcclxuXHJcblxyXG4vKipcclxuICogc2NhbGVcclxuICovXHJcbnZlYzIucHJvdG90eXBlLnNjYWxlID0gZnVuY3Rpb24gKCB2ICkge1xyXG4gIHRoaXMueCAqPSB2O1xyXG4gIHRoaXMueSAqPSB2O1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbnZlYzIuc2NhbGUgPSBmdW5jdGlvbiggYSwgYiwgb3V0ICkge1xyXG4gIG91dFsgMCBdID0gYVsgMCBdICogYjtcclxuICBvdXRbIDEgXSA9IGFbIDEgXSAqIGI7XHJcbn07XHJcblxyXG4vLyBhbGlhc2VzXHJcbnZlYzIucHJvdG90eXBlLm11bHQgPSB2ZWMyLnByb3RvdHlwZS5zY2FsZTtcclxudmVjMi5tdWx0ID0gdmVjMi5zY2FsZTtcclxuXHJcblxyXG4vKipcclxuICogbWluXHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5taW4gPSBmdW5jdGlvbiAoIHYxLCB2MiApIHtcclxuICB2YXIgeCA9IE1hdGgubWluKCB2MS54LCB2Mi54ICksXHJcbiAgICAgIHkgPSBNYXRoLm1pbiggdjEueSwgdjIueSApO1xyXG5cclxuICByZXR1cm4gbmV3IHZlYzIoIHgsIHkgKTsgIFxyXG59O1xyXG5cclxudmVjMi5taW4gPSBmdW5jdGlvbiAoIGEsIGIsIG91dCApIHtcclxuICBvdXRbIDAgXSA9IE1hdGgubWluKCBhWyAwIF0sIGJbIDAgXSApO1xyXG4gIG91dFsgMSBdID0gTWF0aC5taW4oIGFbIDEgXSwgYlsgMSBdICk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIG1heFxyXG4gKi9cclxudmVjMi5wcm90b3R5cGUubWF4ID0gZnVuY3Rpb24gKCB2MSwgdjIgKSB7XHJcbiAgdmFyIHggPSBNYXRoLm1heCggdjEueCwgdjIueCApLFxyXG4gICAgICB5ID0gTWF0aC5tYXgoIHYxLnksIHYyLnkgKTtcclxuICBcclxuICByZXR1cm4gbmV3IHZlYzIoIHgsIHkgKTtcclxufTtcclxuXHJcbnZlYzIubWF4ID0gZnVuY3Rpb24gKCBhLCBiLCBvdXQgKSB7XHJcbiAgb3V0WzBdID0gTWF0aC5tYXgoIGFbIDAgXSwgYlsgMCBdICk7XHJcbiAgb3V0WzFdID0gTWF0aC5tYXgoIGFbIDEgXSwgYlsgMSBdICk7XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIGV1Y2xpZGlhbiBkaXN0YW5jZVxyXG4gKi9cclxudmVjMi5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbiAoIHYgKSB7XHJcbiAgdmFyIHggPSB2LnggLSB0aGlzLngsXHJcbiAgICAgIHkgPSB2LnkgLSB0aGlzLnk7XHJcbiAgcmV0dXJuIE1hdGguc3FydCggeCAqIHggKyB5ICogeSApO1xyXG59O1xyXG5cclxudmVjMi5kaXN0YW5jZSA9IGZ1bmN0aW9uICggYSwgYiApIHtcclxuICB2YXIgeCA9IGJbIDAgXSAtIGFbIDAgXSxcclxuICAgICAgeSA9IGJbIDEgXSAtIGFbIDEgXTtcclxuICByZXR1cm4gTWF0aC5zcXJ0KCB4ICogeCArIHkgKiB5ICk7XHJcbn07XHJcbi8vIGFsaWFzZXNcclxudmVjMi5wcm90b3R5cGUuZGlzdCA9IHZlYzIucHJvdG90eXBlLmRpc3RhbmNlO1xyXG52ZWMyLmRpc3QgPSB2ZWMyLmRpc3RhbmNlO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBuZWdhdGVcclxuICovXHJcbnZlYzIucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uICggKSB7XHJcbiAgdGhpcy54ID0gLSB0aGlzLng7XHJcbiAgdGhpcy55ID0gLSB0aGlzLnk7XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxudmVjMi5uZWdhdGUgPSBmdW5jdGlvbiAoIGEsIG91dCApIHtcclxuICBvdXRbIDAgXSA9IC1hWyAwIF07XHJcbiAgb3V0WyAxIF0gPSAtYVsgMSBdO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBpbnZlcnNlXHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5pbnZlcnNlID0gZnVuY3Rpb24gKCApIHtcclxuICB0aGlzLnggPSAxLjAgLyB0aGlzLng7XHJcbiAgdGhpcy55ID0gMS4wIC8gdGhpcy55O1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbnZlYzIuaW52ZXJzZSA9IGZ1bmN0aW9uKCBhLCBvdXQgKSB7XHJcbiAgb3V0WyAwIF0gPSAxLjAgLyBhWyAwIF07XHJcbiAgb3V0WyAxIF0gPSAxLjAgLyBhWyAxIF07XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIGRvdCBwcm9kdWN0XHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiAoIHYgKSB7IFxyXG4gIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XHJcbn07XHJcblxyXG52ZWMyLmRvdCA9IGZ1bmN0aW9uICggYSwgYiApIHtcclxuICByZXR1cm4gYVsgMCBdICogYlsgMCBdICsgYVsgMSBdICogYlsgMSBdO1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBoZWFkaW5nXHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5oZWFkaW5nID0gZnVuY3Rpb24gKCApIHtcclxuICByZXR1cm4gTWF0aC5hdGFuMiggdGhpcy54LCB0aGlzLnkgKTtcclxufTtcclxuXHJcbnZlYzIuaGVhZGluZyA9IGZ1bmN0aW9uICggYSApIHtcclxuICByZXR1cm4gTWF0aC5hdGFuMiggYVsgMCBdLCBhWyAxIF0gKTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogcm90YXRlXHJcbiAqL1xyXG52ZWMyLnByb3RvdHlwZS5yb3RhdGUgPSBmdW5jdGlvbiggYW5nbGUgKSB7XHJcbiAgdmFyIGhlYWRpbmcgPSB0aGlzLmhlYWRpbmcoKSArIGFuZ2xlO1xyXG4gIHZhciBsZW4gPSB0aGlzLmxlbigpO1xyXG5cclxuICB0aGlzLnggPSBNYXRoLmNvcyggaGVhZGluZyApICogbGVuO1xyXG4gIHRoaXMueSA9IE1hdGguc2luKCBoZWFkaW5nICkgKiBsZW47XHJcblxyXG4gIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxudmVjMi5yb3RhdGUgPSBmdW5jdGlvbiAoIGEsIGFuZ2xlLCBvdXQgKSB7XHJcbiAgdmFyIGhlYWRpbmcgPSB2ZWMyLmhlYWRpbmcoIGEgKSArIGFuZ2xlO1xyXG4gIHZhciBsZW4gPSB2ZWMyLmxlbiggYSApO1xyXG5cclxuICBvdXRbIDAgXSA9IE1hdGguc2luKCBoZWFkaW5nICkgKiBsZW47XHJcbiAgb3V0WyAxIF0gPSBNYXRoLmNvcyggaGVhZGluZyApICogbGVuO1xyXG5cclxuICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcblxyXG4vKipcclxuICogbGluZWFyIGludGVycG9sYXRpb25cclxuICovXHJcbnZlYzIucHJvdG90eXBlLmxlcnAgPSBmdW5jdGlvbiAoIHYsIHQgKSB7XHJcbiAgdmFyIHggPSB0aGlzLngsXHJcbiAgICAgIHkgPSB0aGlzLnk7XHJcbiAgeCA9IHggKyB0ICogKCB2LnggLSB4ICk7XHJcbiAgeSA9IHkgKyB0ICogKCB2LnkgLSB5ICk7XHJcblxyXG4gIHJldHVybiBuZXcgdmVjMiggeCwgeSApO1xyXG59O1xyXG5cclxudmVjMi5sZXJwID0gZnVuY3Rpb24gKCBhLCBiLCB0LCBvdXQgKSB7XHJcbiAgICB2YXIgYXggPSBhWyAwIF0sXHJcbiAgICAgICAgYXkgPSBhWyAxIF07XHJcbiAgICBvdXRbIDAgXSA9IGF4ICsgdCAqICggYlsgMCBdIC0gYXggKTtcclxuICAgIG91dFsgMSBdID0gYXkgKyB0ICogKCBiWyAxIF0gLSBheSApO1xyXG4gICAgcmV0dXJuIG91dDtcclxufTtcclxuXHJcbnNvbWUudmVjMiA9IHZlYzI7XHJcbm1vZHVsZS5leHBvcnRzID0gc29tZTsiXX0=
