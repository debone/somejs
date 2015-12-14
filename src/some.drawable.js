p5.SDrawable = function ( /* p5 Canvas */ world ) {
  this.world = world;

  this.position = new p5.Vector();
  this.size = new p5.Vector( 1, 0 );
  this.axis = new p5.Vector( 1, 0 );
  this.scale = 1;
  // TODO this.direction
  this.anchor = new p5.Vector( 1, 0 );
  this.originalAxis = new p5.Vector( 1, 0 );
  
  this.from = new p5.Vector(); 
  this.to = new p5.Vector();
};

p5.SDrawable.prototype.setPosition = function ( /* float */ x, /* float */ y ) {
  this.position.set( x, y );
  return this;
};

p5.SDrawable.prototype.setSize = function ( /* float */ x, /* float */ y ) {
  this.size.set( x, y );
  return this;
};

p5.SDrawable.prototype.setAnchor = function ( /* float */ x, /* float */ y ) {
  this.anchor.set( x, y );
  return this;
}

p5.SDrawable.prototype.setAxis = function ( /* float */ x, /* float */ y ) {
  this.axis.set( x, y );
  this.originalAxis.set( x, y );
  return this;
};

p5.SDrawable.prototype.setRotation = function ( /* float */ angle ) {
  angle = this.world.radians( angle );
  this.axis.rotate( this.originalAxis.heading() - this.axis.heading() + angle );
  return this;
};

p5.SDrawable.prototype.setScale = function ( /* float */ scale ) {
  this.scale = scale || 1;
  return this;
};

p5.SDrawable.prototype.draw = function ( /* p5.Vector */ from, /* p5.Vector */ size, /* float */ sizeX, /* float */ sizeY ) {
  if ( typeof sizeX !== "undefined" && typeof sizeY !== "undefined" ) {
    // fromX, fromY
    this.from.set( from, size );
    this.to.set( sizeX, sizeY );
  }
  else {
    this.from.set( from || this.position );
    this.to.set( size || this.size );
  }

  var magnitude = this.to.mag() / this.axis.mag();

  // Center anchor
  //this.from.add( this.anchor ); 

  this.world.push();
    this.world.translate( this.from.x, this.from.y );
    this.world.rotate( this.to.heading() - this.axis.heading() );
    this.world.translate( this.anchor.x, this.anchor.y );
    this.world.scale( this.scale ); 
    this.world.strokeWeight( 1 / this.scale );

    this.representation();
  
    if ( DEBUG ) {
      this.world.rotate( this.to.heading() + this.axis.heading() );
      this.world.stroke( 255, 100, 250 );
      this.world.strokeWeight( 2 );
      this.world.line( 0,0 , this.to.x,this.to.y );
      this.world.noStroke();
      this.world.fill( 0, 100, 80 );
      this.world.rect( -4,-4, 8,8 );
      this.world.fill( 150, 150, 100 ); 
      this.world.rect( this.to.x - 4, this.to.y - 4, 8,8 );
      this.world.fill( 200, 150, 100 ); 
      this.world.rect( this.anchor.x - 4, this.anchor.y - 4, 8,8 );
      this.world.rotate( this.to.heading() );
      this.world.stroke( 0, 0, 0 );
      this.world.line( 0,0, this.axis.x, this.axis.y );
    }
  this.world.pop();

  return this;
};

p5.SDrawable.prototype.representation = function () {

};

p5.prototype.createSDrawable = function ( /* p5 Canvas */ world ) {
  return new p5.SDrawable( world );
};