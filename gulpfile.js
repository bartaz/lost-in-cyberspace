/* eslint-env node */

var fs = require('fs'),
	cheerio = require('cheerio'),
	composer = require('gulp-uglify/composer'),
	concat = require('gulp-concat'),
	cssmin = require('gulp-cssmin'),
	del = require('del'),
	gulp = require('gulp'),
	htmlmin = require('gulp-htmlmin'),
	merge = require('merge-stream'),
	replace = require('gulp-replace'),
	uglifyes = require('uglify-es'),
	zip = require('gulp-zip');

var minify = composer(uglifyes, console);

var htmls = ['index.html', 'terminal.html', 'cyberspace.html'];

// build config for each html file:
// config = {
//  'index.html': {
//     js: [ ... ],
//     externaljs: [ ... ],
//     css: [ ... ]
//   }
// }
var config = {};

gulp.task('default', ['build']);

gulp.task('build', ['initbuild', 'jsmin', 'cssmin', 'inline', 'zip', 'clean:tmp', 'report']);


function initHtmlBuildConfig(html) {
	config[html] = {
		js: [],
		externaljs: [],
		css: []
	};

	// get a list of all js scripts from our dev file
	var file = l = fs.readFileSync(html, 'utf-8', function(e, data) {
		return data;
	});

	var $ = cheerio.load(file);

	$('script').each(function() {
		var src = $(this).attr('src');
		if (src) {
			if (src.indexOf('http') === 0) {
				config[html].externaljs.push(src);
			} else {
				config[html].js.push(src);
			}
		}
	});

	$('link[rel="stylesheet"]').each(function() {
		var src = $(this).attr('href');
		config[html].css.push(src);
	});
}

gulp.task('initbuild', ['clean:zip'], function() {
	var stream;

	htmls.forEach(initHtmlBuildConfig);

	return stream;
});

gulp.task('jsmin', ['initbuild'], function() {
	var tasks = htmls.map(function(html) {
		return gulp.src(config[html].js)
			.pipe(concat(html + '.js')) //all js files are concatenated into *.js
			.pipe(minify())
			.pipe(gulp.dest('./tmp'));
	});

	return merge(tasks);
});

gulp.task('cssmin', ['initbuild'], function() {
	var tasks =  htmls.map(function(html) {
		return gulp.src(config[html].css)
			.pipe(concat(html + '.css')) //all js files are concatenated into *.css
			.pipe(cssmin())
			.pipe(gulp.dest('./tmp'));
	});

	return merge(tasks);
});

gulp.task('inline', ['jsmin', 'cssmin'], function() {
	var tasks = htmls.map(function(html) {
		var c = config[html];

		var js, css;

		var stream = gulp.src(html)
			.pipe(replace(/<.*?script.*?>.*?<\/.*?script.*?>/igm, ''))
			.pipe(replace(/<.*?link.*rel="stylesheet".*?\/>/igm, ''))

		if (c.externaljs.length) {
			js = c.externaljs.map(function(src) { return '<script src="' + src + '"></script>'}).join();
			stream = stream.pipe(replace(/<\/head>/igm, js+'</head>'));
		}

		if (c.js.length > 0) {
			js = fs.readFileSync('./tmp/' + html + '.js', 'utf-8', function(e, data) {
				return data;
			});

			stream = stream.pipe(replace(/<\/body>/igm, '<script>'+js+'</script></body>'))
		}

		if (c.css.length > 0) {
			css = fs.readFileSync('./tmp/' + html + '.css', 'utf-8', function(e, data) {
				return data;
			});

			stream = stream.pipe(replace(/<\/body>/igm, '<style>'+css+'</style></body>'))
		}

		stream = stream
			.pipe(htmlmin({collapseWhitespace: true}))
			.pipe(gulp.dest('./tmp'));

		return stream;
	});

	return merge(tasks);
});

gulp.task('zip', ['inline'], function() {
	var stream = gulp.src('./tmp/*.html')
		.pipe(zip('game.zip'))
		.pipe(gulp.dest('.'));

	return stream;
});

gulp.task('clean:zip', function() {
	return del('game.zip');
});

gulp.task('clean:tmp', ['zip'], function() {
	return del('./tmp');
});

gulp.task('report', ['zip'], function() {
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
