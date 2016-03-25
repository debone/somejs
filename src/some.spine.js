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