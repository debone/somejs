'use strict';

var some = require( './some.core' );

var spine = function ( world, shapeBeziers, shapeAxis, steps, bend  ) {
  some.shape.call( this, world, shapeBeziers, shapeAxis );

  this.drawables = [ ];
  this.fromVerts = [ ];
  this.toVerts = [ ];

  this.index = -1;

  this.originVerts = [ ];

  this.shapeLength = [ ];
  this.shapePoints = [ ];

  this.shapeTotalLength = 0.0;

  this.init();

  if ( typeof steps !== "undefined" ) {
    this.generate( steps, bend || 0 );
  }

  return this;
};

spine.prototype = Object.create( some.drawable.prototype );

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

spine.prototype._findClosestT = function ( /* int */ shape, /* int */ s ) {
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

spine.prototype.generate = function ( /* int */ steps, /* int */ bend ) {
  var progress = 0, 
      shapeProgress = 0.001,
      shapeStep = 0,
      step = this.shapeTotalLength / steps,
      t, s;

  this.fromVerts = [];
  this.toVerts = [];

  //Make move absolute
  this.originVerts = [];
  this.originHeadings = [];

  for( var i = 0; i < steps; i++, shapeProgress += step ) {
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

    if ( bend === 1 ) {
      some.vec2.mult( this.toVerts[ i ], -1, this.toVerts[ i ] );
    }
    else if ( bend === 2 ) {
      some.vec2.copy( this.fromVerts[ i ], this.fromVerts[ i + steps ] );
      some.vec2.copy( this.toVerts[ i ], this.toVerts[ i + steps ] );
    }
  }

  return this;
};

spine.prototype.rotateVerts = function ( /*float*/ angle ) {
  angle = angle * some.toRadians;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    some.vec2.rotate( this.toVerts[ i ], this.originHeadings[ i ] + angle - some.vec2.heading( this.toVerts[ i ] ), this.toVerts[ i ] );
  }

  return this;
};

spine.prototype.moveVerts = function ( /*PVector*/ movement ) {
  var angle;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    angle = some.vec2.heading( this.toVerts[ i ] ) - Math.abs( some.vec2( movement ) );
    some.vec2.rotate( movement, angle, movement );
    some.vec2.copy( this.originVerts[ i ], this.fromVerts[ i ] );
    some.vec2.add( this.fromVerts[ i ], movement, this.fromVerts[ i ] );
    some.vec2.rotate( movement, - angle, movement );
  }

  return this;
};

spine.prototype.next = function () {
  if ( this.index + 1 !== this.fromVerts.length ) {
    this.index++;
  }
  else {
    this.index = 0;
  }
  return true;
};

spine.prototype.get = function () {
  return {
    from: this.fromVerts[ this.index ],
    to: this.toVerts[ this.index ]
  };
};

spine.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

some.spine = spine;

module.exports = some;