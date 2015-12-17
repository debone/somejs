var gulp = require( 'gulp' );
var browserify = require( 'browserify' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var gutil = require( 'gulp-util' );
var uglify = require( 'gulp-uglify' );

gulp.task( 'default', function ( ) {
  var b = browserify({
    entries: './app.js',
    debug: true
  });

  return b.bundle( )
    .pipe( source( 'some.js' ) )
    .pipe( buffer( ) )
    // Add transformation tasks to the pipeline here.
    .pipe( uglify( ) ).on( 'error', gutil.log )
    .pipe( gulp.dest( './dist/' ) );
} );