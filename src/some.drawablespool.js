p5.SDrawablesPool = function ( /* p5 Canvas */ world, /* object */ options ) {
  this.world = world;

  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  this.drawFunction = false;

  this.index = -1;

  options = options || { };

  if ( options.select ) {
    // How is the pool being draw?
  }

  if ( options.draw ) { 
    // Unique draw function
    this.drawFunction = options.draw;
  }
};

p5.SDrawablesPool.prototype.add = function ( /* SDrawable */ drawable, /* int */ count, /* Custom draw function */ drawableFunction ) {
  count = count || 1;
  if ( drawable instanceof p5.SDrawable ) {
    while ( count -- ) {
      this.drawables[ this.drawables.length ] = drawable;
      this.drawablesFunctions[ this.drawablesFunctions.length ] = drawableFunction || function ( ) { };
    }
  }

  return this;
};

p5.SDrawablesPool.prototype.remove = function ( /* int */ index ) {
  if ( index > -1 ) {
    this.drawables = this.drawables.splice( index, 1 );
    this.drawablesFunctions = this.drawablesFunctions.splice( index, 1 );
  }

  return this;
};

p5.SDrawablesPool.prototype.clear = function ( ) {
  this.drawables = [ ];
  this.drawablesFunctions = [ ];

  return this;
};

p5.SDrawablesPool.prototype.next = function ( ) {
  if ( this.index + 1 !== this.drawables.length ) {
    this.index++;
    return true;
  }
  this.index = -1;
  return false;
};

p5.SDrawablesPool.prototype.get = function ( ) {
  return { 
    drawable: this.drawables[ this.index ],
    fn: ( this.drawFunction ) ? this.drawFunction : this.drawablesFunctions[ this.index ]
  };
};

p5.SDrawablesPool.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

p5.prototype.createSDrawablesPool = function ( /* p5 Canvas */ world, /* object */ options ) {
  return new p5.SDrawablesPool( world, options );
};