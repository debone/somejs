p5.SGrid = function ( /* p5 Canvas */ world, /* int */ width, /* int */ count, /* object */ options ) {
  this.world = world;

  this.fromVerts = [ ];
  this.toVerts = [ ];

  this.index = -1;

  this.originVerts = [ ];
  this.originHeadings = [ ];

  this.width = width;
  this.count = count;

  options = options || { };

  this.horizontal = options.horizontal || 1;
  this.vertical = options.vertical || 1;

  this.generate( width, count, options.bend || 0 );

  return this;
};

p5.SGrid.prototype = Object.create( p5.SDrawable.prototype );

p5.SGrid.prototype.generate = function ( /* int */ width, /* int */ count, /* int */ bend ) {
  var t, s;

  this.fromVerts = [];
  this.toVerts = [];

  //Make move absolute
  this.originVerts = [];
  this.originHeadings = [];

  for( var i = 0; i < count; i++ ) {
    //boom new vert
    this.fromVerts[ i ] = new p5.Vector( 
      this.horizontal * ( i % width ) , 
      this.vertical * Math.floor( i / width)
    );

    this.toVerts[ i ] = new p5.Vector(
      1, 
      0
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
      this.fromVerts[ i + width ] = this.fromVerts[ i ].copy();
      this.toVerts[ i + width ] = this.toVerts[ i ].copy();
    }
  }

  return this;
};

p5.SGrid.prototype.rotateVerts = function ( /*float*/ angle ) {
  angle = this.world.radians( angle );
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    this.toVerts[ i ].rotate( this.originHeadings[i] + angle - this.toVerts[ i ].heading() );
  }

  return this;
};

p5.SGrid.prototype.moveVerts = function ( /*PVector*/ movement ) {
  var angle;
  for ( var i = 0, l = this.toVerts.length; i < l; i++ ) {
    angle = this.toVerts[ i ].heading() - Math.abs( movement.heading() );
    movement.rotate( angle );
    this.fromVerts[ i ] = p5.Vector.add( this.originVerts[ i ], movement );
    movement.rotate( -angle );
  }

  return this;
};

p5.SGrid.prototype.setMargin = function ( /* float */ horizontal, /* float */ vertical, /* int */ bend ) {
  this.horizontal = horizontal || this.horizontal;
  this.vertical = vertical || horizontal || this.vertical;

  this.generate( this.width, this.count, bend || 0 );
};

p5.SGrid.prototype.next = function () {
  if ( this.index + 1 !== this.fromVerts.length ) {
    this.index++;
  }
  else {
    this.index = 0;
  }
  return true;
};

p5.SGrid.prototype.get = function () {
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

p5.SGrid.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

p5.prototype.createSGrid = function ( /* p5 Canvas */ world, /* int */ width, /* int */ count, /* object */ options ) {
  return new p5.SGrid( world, width, count, options );
};