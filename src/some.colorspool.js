p5.SColorsPool = function ( /* p5 Canvas */ world, /* object */ options ) {
  this.world = world;

  this.colors = [ ];

  this.index = -1;

  options = options || { };

  if ( typeof options.select !== "undefined" ) {
    // How is the pool being draw?
  }
};

p5.SColorsPool.prototype.add = function ( /* Color */ color, /* int */ count ) {
  count = count || 1;
  if ( color instanceof p5.Color ) {
    while ( count -- ) {
      this.colors[ this.colors.length ] = color;
    }
  }

  return this;
};

p5.SColorsPool.prototype.remove = function ( /* int */ index ) {
  if ( index > -1 ) {
    this.colors = this.colors.splice( index, 1 );
  }

  return this;
};

p5.SColorsPool.prototype.clear = function ( ) {
  this.colors = [ ];

  return this;
};

p5.SColorsPool.prototype.next = function ( ) {
  if ( this.index + 1 !== this.colors.length ) {
    this.index++;
  }
  else {
    this.index = 0;
  }
  return true;
};

p5.SColorsPool.prototype.get = function ( ) {
  return { 
    stroke: this.colors[ this.index + 1 ],
    fill: this.colors[ this.index ]
  };
};

p5.SColorsPool.prototype.reset = function ( ) {
  this.index = -1;
  return this;
};

p5.prototype.createSColorsPool = function ( /* p5 Canvas */ world, /* object */ options ) {
  return new p5.SColorsPool( world, options );
};