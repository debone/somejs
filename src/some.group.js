p5.SGroup = function ( /* p5 Canvas */ world, /* object */ options ) {
  p5.SDrawable.call( this, world );

  this.SLayout = {
    next: function () { }
  };
  this.SColorsPool = {
    next: function () { }
  };
  this.SDrawablesPool = {};

  options = options || { };

  if ( typeof options.layout !== "undefined" ) {
    this.SLayout = options.layout;
  }
  if ( typeof options.colorsPool !== "undefined" ) {
    this.SColorsPool = options.colorsPool;
  }
  if ( typeof options.drawablesPool !== "undefined" ) {
    this.SDrawablesPool = options.drawablesPool;
  }

  return this; 
};

p5.SGroup.prototype = Object.create( p5.SDrawable.prototype );

p5.SGroup.prototype.setDrawablesPool = function ( /* SDrawablesPool */ drawablesPool ) {
  this.SDrawablesPool = drawablesPool;
  return this;
};

p5.SGroup.prototype.setColorsPool = function ( /* SColorsPool */ colorsPool ) {
  this.SColorsPool = colorsPool;
  return this;
};

p5.SGroup.prototype.setLayout = function ( /* SLayout */ layout ) {
  this.SLayout = layout;
  return this;
};

p5.SGroup.prototype.representation = function ( ) {
  var n, c, p;
  this.SLayout.reset();
  //this.SColorsPool.reset();
  while ( this.SDrawablesPool.next() ) {
    n = this.SDrawablesPool.get();

    if ( this.SLayout.next() ) { 
      p = this.SLayout.get();
      n.drawable.setPosition( p.from.x, p.from.y );
      n.drawable.setSize( p.to.x, p.to.y );
    }

    if ( this.SColorsPool.next() ) {
      c = this.SColorsPool.get();

      if ( c.fill ) {
        this.world.fill( c.fill );
      }
      else {
        this.world.noFill();
      }

      if ( c.stroke ) {
        this.world.stroke( c.stroke );
      }
      else {
        this.world.noStroke();
      }
    }

    if ( ! n.fn( this.world, n.drawable ) ) {
      n.drawable.draw();
    }
  }
};

p5.prototype.createSGroup = function ( /* p5 Canvas */ world, /* object */ options ) {
  return new p5.SGroup( world, options );
};