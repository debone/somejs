p5.SShape = function ( /* p5 Canvas */ world, /* float[][] */ shapeBeziers, /* float[] or p5.Vector */ shapeAxis ) {
  p5.SDrawable.call( this, world );

  this.shape = [ ];
  this.c1 = [ ];
  this.c2 = [ ];
  this.shapeSize = shapeBeziers.length;

  if ( shapeAxis instanceof p5.Vector ) {
    this.axis = shapeAxis;
  }
  else {
    this.axis = new p5.Vector( shapeAxis.shift(), shapeAxis.shift() );
  }

  this.size = this.axis.copy();
  this.shapeSize = Math.floor( this.shapeSize / 6 );

  this.shape.push( new p5.Vector( shapeBeziers.shift(), shapeBeziers.shift() ) );

  for ( var i = 0; i < this.shapeSize; i++ ) {
    this.c1.push( new p5.Vector( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.c2.push( new p5.Vector( shapeBeziers.shift(), shapeBeziers.shift() ) );
    this.shape.push( new p5.Vector( shapeBeziers.shift(), shapeBeziers.shift() ) );
  }

  return this;
};

p5.SShape.prototype = Object.create( p5.SDrawable.prototype );

p5.SShape.prototype.representation = function ( ) {
  this.world.beginShape();
    this.world.vertex( this.shape[ 0 ].x, this.shape[ 0 ].y );
    for( var i = 0; i < this.shapeSize; i++ ) {
      this.world.bezierVertex(
        this.c1[ i ].x, this.c1[ i ].y, 
        this.c2[ i ].x, this.c2[ i ].y, 
        this.shape[ i + 1 ].x, this.shape[ i + 1 ].y
      );
    }
  this.world.endShape();
};


p5.prototype.createSShape = function ( /* p5 Canvas */ world, /* float[ ][ ] */ shapeBeziers, /* p5.Vector */ shapeAxis ) {
  return new p5.SShape( world, shapeBeziers, shapeAxis );
};