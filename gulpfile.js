/* eslint-env node */

var fs = require('fs'),
	cheerio = require('cheerio'),
	gulp = require('gulp'),
	cssmin = require('gulp-cssmin'),
	concat = require('gulp-concat'),
	htmlmin = require('gulp-htmlmin'),
  // TODO: rimraf is deprecated, use del
  // https://github.com/gulpjs/gulp/blob/master/docs/recipes/delete-files-folder.md
	//rimraf = require('gulp-rimraf'),
	replace = require('gulp-replace'),
	uglify = require('gulp-uglify'),
	zip = require('gulp-zip'),
	exclude_min = [], //eg ['js/lib/jsfxr.min.js']
	config = { js: [] };

var uglifyjs = require('uglify-es');
var composer = require('gulp-uglify/composer');
var minify = composer(uglifyjs, console);

gulp.task('default', ['build']);

gulp.task('build', ['initbuild', 'jsmin', 'cssmin', 'inline', 'zip', 'clean', 'report']);

gulp.task('initbuild', function() {

	var stream, html, $, src, js = [], css = [];

  // TODO: use del
	// delete prev files
	// stream = gulp.src('game.zip')
	// 	.pipe(rimraf());

	// get a list of all js scripts from our dev file
	html = fs.readFileSync('index.html', 'utf-8', function(e, data) {
		return data;
	});

	$ = cheerio.load(html);

	$('script').each(function() {
		src = $(this).attr('src');
		if (src && exclude_min.indexOf(src) === -1) { //exclude already minified files
			js.push(src);
		}
	});

	config.js = js;

	$('link[rel="stylesheet"]').each(function() {
		src = $(this).attr('href');
		if (exclude_min.indexOf(src) === -1) { //exclude already minified files
			css.push(src);
		}
	});

	config.css = css;

	return stream;
});

gulp.task('jsmin', ['initbuild'], function() {
  console.log(config.js);
	var stream = gulp.src(config.js)
		.pipe(concat('g.js')) //all js files are concatenated into g.js
		.pipe(minify())
		.pipe(gulp.dest('./tmp'));

	return stream;

});

gulp.task('cssmin', ['initbuild'], function() {

	var stream = gulp.src(config.css)
		.pipe(concat('s.css'))//all js files are concatenated into s.css
		.pipe(cssmin())
		.pipe(gulp.dest('./tmp'));

	return stream;
});

gulp.task('inline', ['jsmin', 'cssmin'], function() {
	var i, extra_js = '';

	var js = fs.readFileSync('./tmp/g.js', 'utf-8', function(e, data) {
		return data;
	});

	//include already minified files
	for (i = 0; i < exclude_min.length; i += 1) {
		console.log(exclude_min[i]);
		extra_js += fs.readFileSync(exclude_min[i], 'utf-8', function(e, data) {
			return data;
		});
	}
	console.log(extra_js.length, 'OK', exclude_min);

	var css = fs.readFileSync('./tmp/s.css', 'utf-8', function(e, data) {
		return data;
	});

	var stream = gulp.src('index.html')
		.pipe(replace(/<.*?script.*?>.*?<\/.*?script.*?>/igm, ''))
		.pipe(replace(/<\/body>/igm, '<script>'+extra_js+' '+js+'</script></body>'))
		.pipe(replace(/<.*?link.*rel="stylesheet".*?\/>/igm, ''))
		.pipe(replace(/<\/head>/igm, '<style>'+css+'</style></head>'))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('./tmp'));

	return stream;

});

gulp.task('zip', ['inline'], function() {
	var stream = gulp.src('./tmp/index.html')
		.pipe(zip('game.zip'))
		.pipe(gulp.dest('.'));

	return stream;
});

gulp.task('clean', ['zip'], function() {
  // TODO: use del
	// var stream = gulp.src('./tmp')
	// 	.pipe(rimraf());

	//return stream;
});

gulp.task('report', ['clean'], function() {
	var stat = fs.statSync('game.zip'),
		limit = 1024 * 13,
		size = stat.size,
		remaining = limit - size,
		percentage = (remaining / limit) * 100;

	percentage = Math.round(percentage * 100) / 100;

	console.log('\n\n-------------');
	console.log('BYTES USED: ' + stat.size);
	console.log('BYTES REMAINING: ' + remaining);
	console.log(percentage +'%');
	console.log('-------------\n\n');
});
