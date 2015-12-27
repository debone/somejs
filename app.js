'use strict';

window.some = require( './src/some.core' );

var DEBUG = ( typeof DEBUG === "undefined") ? true : false;

if ( DEBUG ) window.DEBUG = true;

require( './src/some.random' );
require( './src/some.noise' );
require( './src/some.vec2' );

require( './src/some.drawable' );
require( './src/some.canvas' );
require( './src/some.shape' );

require( './src/some.brush' );

require( './src/some.grid' );
require( './src/some.spine' );

require( './src/some.colorspool' );
require( './src/some.drawablespool' );

require( './src/some.group' );

module.exports = some;