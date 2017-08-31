// Dependencies.
var gulp            = require('gulp');
var gutil           = require('gulp-util');
var del             = require('del');
var stylus          = require('gulp-stylus');
var postcss         = require('gulp-postcss');
var cssmin          = require('gulp-cssmin');
var imagemin        = require('gulp-imagemin');
var rename          = require('gulp-rename');
var concat          = require('gulp-concat');
var uglify          = require('gulp-uglify');
var rupture         = require('rupture');
var lost            = require('lost');
var rucksack        = require('rucksack-css');
var autoprefixer    = require('autoprefixer');
var browserSync     = require('browser-sync').create();
var reload          = browserSync.reload;

// Include paths file.
var paths = require('./paths');

// stylus - Compiles stylus file.
gulp.task('stylus', function() {
  var stylus_options = {
    use : [     
        rupture()
    ]
  }
  
  return gulp.src(paths.stylusAppFile)
    .pipe(stylus(stylus_options))
    .pipe(gulp.dest(paths.assetsDir));
});

// postcss - Run postcss processors.
gulp.task('postcss', function() {
  var processors = [
    rucksack,
    lost,
    autoprefixer ({
      browsers:['last 2 version']
    })
  ];

  return gulp.src(paths.assetsDir + 'app.css')
    .pipe(postcss(processors))
    .pipe(gulp.dest(paths.assetsDir))
});

// mincss - Minify app.css file.
gulp.task ('mincss', function() {
  return gulp.src(paths.assetsDir + 'app.css')
    .pipe(cssmin())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.jekyllCssDirr));
});

// Styles:watch Task - Reloads html files
gulp.task('styles:watch', function(){
  return gulp.src(paths.stylusAppFile)
    .pipe(reload({ stream:true }));
});

// styles - Run styles tasks.
gulp.task('styles', gulp.series('stylus', 'postcss', 'mincss', 'styles:watch'));

// concatjs - Concatenates *.js files.
gulp.task ('concatjs', function() {
  return gulp.src([paths.jsVendorsDir, paths.jsModulesDir])
    .pipe(concat('app.js'))
    .pipe(gulp.dest(paths.assetsDir));
});

// uglify - Compress *.js files.
gulp.task('uglify', function() {
  return gulp.src(paths.assetsDir + 'app.js')
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.jekyllJsDir));
});

// Scripts:watch Task - Reloads html files
gulp.task('scripts:watch', function(){
  return gulp.src(paths.scriptsPattern)
    .pipe(reload({ stream:true }));
});

// scripts - Run scripts tasks.
gulp.task('scripts', gulp.series('concatjs', 'uglify', 'scripts:watch'));

// images - Optimize images.
gulp.task('images', function() {
  return gulp.src(paths.imgPattern)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.jekyllImgDir));
});

// build:jekyll - Runs jekyll build command.
gulp.task('build:jekyll', function() {
  var shellCommand = 'bundle exec jekyll build';

  return gulp.src('')
    .pipe(run(shellCommand))
    .on('error', gutil.log);
});

// clean:jekyll - Deletes the entire _site directory.
gulp.task('clean:jekyll', function(callback) {
    del(['_site']);
    callback();
});

// build:assets - Build assets parallel
gulp.task('build:assets', gulp.parallel('styles', 'scripts'));

// build - Builds site anew.
gulp.task('build', gulp.series('clean:jekyll', 'build:assets', 'build:jekyll', 'build:jekyll:watch'));

// build:jekyll:watch - Special tasks for building and then reloading BrowserSync.
gulp.task('build:jekyll:watch', function(callback) {
  .pipe(reload({ stream:true }));
  callback();
});

// server task - Run server
gulp.task('server', ['build'], function() {
  browserSync.init({
    server: paths.siteDir,
    port: 3000,
    browser: "google chrome"
  });

  gulp.watch(paths.jekyllCongif, gulp.series('build'));
  gulp.watch(paths.mdPattern, gulp.series('build'));
  gulp.watch(paths.imgPattern, gulp.series('images', 'build'));
  gulp.watch(paths.stylusPattern, gulp.series('build'));
  gulp.watch(paths.scriptsPattern, gulp.series('build'));
});

// Default Task: builds site.
gulp.task('default', ['server']);