'use strict';

var some = require( 'some' );

spine = function ( world, shapeBeziers, shapeAxis, steps, bend  ) {
  shape.call( this, world, shapeBeziers, shapeAxis );

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
  
  precision = precision || 70;

  for ( var i = 0; i < this.shapeSize; i++ ) {
    this.shapeLength[ i ] = 0;
    this.shapePoints[ i ] = { };
    this.shapePoints[ i ].t = [ ];
    this.shapePoints[ i ].s = [ ];

    step = 1 / ( Math.floor( ( some.vec2.sub( this.shape[ i + 1 ], this.shape[ i ] ).mag() / 25 ) * precision ) + 1 );

    lastX = this.shape[ i ].x;
    lastY = this.shape[ i ].y;
    for ( var t = 0; t <= 1; t += step ) {
      x = this.world.bezierPoint( 
        this.shape[ i ].x, 
        this.c1[ i ].x, 
        this.c2[ i ].x, 
        this.shape[ i + 1 ].x, 
        t 
      );
      y = this.world.bezierPoint( 
        this.shape[ i ].y, 
        this.c1[ i ].y, 
        this.c2[ i ].y, 
        this.shape[ i + 1 ].y, 
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
    this.fromVerts[ i ] = new some.vec2( 
      this.world.bezierPoint( 
        this.shape[ shapeStep ].x, 
        this.c1[ shapeStep ].x, 
        this.c2[ shapeStep ].x, 
        this.shape[ shapeStep + 1 ].x,
        t ), 
      this.world.bezierPoint( 
        this.shape[ shapeStep ].y, 
        this.c1[ shapeStep ].y, 
        this.c2[ shapeStep ].y, 
        this.shape[ shapeStep + 1 ].y, 
        t ) 
    );

    this.toVerts[ i ] = new some.vec2(
      this.world.bezierTangent( 
        this.shape[ shapeStep ].x, 
        this.c1[ shapeStep ].x, 
        this.c2[ shapeStep ].x, 
        this.shape[ shapeStep + 1 ].x,
        t ), 
      this.world.bezierTangent( 
        this.shape[ shapeStep ].y, 
        this.c1[ shapeStep ].y, 
        this.c2[ shapeStep ].y, 
        this.shape[ shapeStep + 1 ].y, 
        t )
    );

    this.originVerts[ i ] = this.fromVerts[ i ].copy();
    this.originHeadings[ i ] = this.toVerts[ i ].heading();

    if ( this.toVerts[ i ].mag() > 0 ) {
      this.toVerts[ i ].normalize();
    }

    if ( bend === 1 ) {
      this.toVerts[ i ].mult( -1 );
    }
    else if ( bend === 2 ) {
      this.fromVerts[ i + steps ] = this.fromVerts[ i ].copy();
      this.toVerts[ i + steps ] = this.toVerts[ i ].copy();
    }
  }

  return this;
};

spine.prototype.rotateVerts = function ( /*float*/ angle ) {
  angle = this.world.radians( angle );
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    this.toVerts[ i ].rotate( this.originHeadings[i] + angle - this.toVerts[ i ].heading() );
  }

  return this;
};

spine.prototype.moveVerts = function ( /*PVector*/ movement ) {
  var angle;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    angle = this.toVerts[ i ].heading() - Math.abs( movement.heading() );
    movement.rotate( angle );
    this.fromVerts[ i ] = some.vec2.add( this.originVerts[ i ], movement );
    movement.rotate( -angle );
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
    from: {
      x: this.fromVerts[ this.index ].x,
      y: this.fromVerts[ this.index ].y
    },
    to: {
      x: this.toVerts[ this.index ].x ,
      y: this.toVerts[ this.index ].y
    }
  };
};

spine.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

some.spine = spine;

module.exports = some;