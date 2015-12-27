var gulp = require( 'gulp' );
var browserify = require( 'browserify' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var gutil = require( 'gulp-util' );
var uglify = require( 'gulp-uglify' );
var jshint = require( 'gulp-jshint' );

gulp.task( 'default', function ( ) {
  var b = browserify({
    entries: './app.js',
    debug: true
  });

  return b.bundle( )
    .pipe( source( 'some.js' ) )
    .pipe( buffer( ) )
    // Add transformation tasks to the pipeline here.
    .pipe( uglify({
        compress: {
            global_defs: {
              DEBUG: false
            }
        }
    }) )
    .pipe( gulp.dest( './dist/' ) )
    .pipe( gulp.dest( '../blog/src/scripts/'));
} );

gulp.task( 'dev', function( ) {  
  var b = browserify({
    entries: './app.js',
    debug: true
  });

  gulp.src( './src/*.js' )
    .pipe( jshint() )
    .pipe( jshint.reporter( 'default' ) )

  return b.bundle( )
    .pipe( source( 'some.js' ) )
    .pipe( buffer( ) )
    .pipe( gulp.dest( './dist/' ) )
    .pipe( gulp.dest( '../blog/src/scripts/'));
});