var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var ts = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var tslint = require("gulp-tslint");
var rimraf = require("gulp-rimraf");
var seq = require("gulp-sequence");
var gzip = require('gulp-gzip');
var tar = require('gulp-tar');
var jasmine = require('gulp-jasmine');
var exec = require('child_process').exec;
var args = require('yargs').argv;

var tsProject = ts.createProject("tsconfig.json", {
    typescript: require("typescript")
});

gulp.task("clean", function () {
    return gulp.src(["dist"], { read: false }).pipe(rimraf());
});

gulp.task("ts:lint", function () {
    return gulp.src(["typescript/**/*.ts", "test/**/*.ts"])
        .pipe(tslint())
        .pipe(tslint.report("verbose", {
            emitError: false
        }));
});

gulp.task("ts:compile", ["ts:lint"], function () {
    var tsResult = gulp.src([
      "typescript/**/*.ts",
      "slec.**/*.ts",
      "../commons/**/*.ts"
    ])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));

    return tsResult.js
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("dist/"));
});

gulp.task("ts:watch", ["ts:compile"], function () {
    gulp.watch(["typescript/**/*.ts", "../commons/**/*.ts", "typings/**/*.d.ts"], ["ts:compile"]);
});


gulp.task('serve', ["ts:watch"], function () {
    nodemon({
        script: 'dist/backend/typescript/server.js',
        "verbose": true,
        "delay": 1000,
        "ignore": ["**/*.js.map", "**/*.spec.js", "**/*.log"],
        "execMap": {
            "js": "node --harmony"
        }
    })
        .on('restart', function () {
            console.log('              [gulp] RAM Backend Server: restarted [OK]');
            console.log('              [gulp] ..................................');
        });
});

gulp.task('seed', ["ts:compile"], function () {
    console.log('Seeding the database ...');
    exec('node dist/backend/typescript/seeding/seed.js --color', function (err, stdout, stderr) {
        if (stdout) {
            console.log(stdout);
        }
        if (err) {
            console.log(err);
        }
    });
});

gulp.task("copy:resources", function (params) {
    return gulp.src(["package.json", "pm2.json"])
        .pipe(gulp.dest("dist/"));
});

gulp.task("publish:tarball",
    ["ts:compile", "copy:resources"], function () {
        return gulp.src("dist/**/*")
            .pipe(tar('backend-dist.tar', { mode: null }))
            .pipe(gzip())
            .pipe(gulp.dest('./'));
    });

gulp.task('test', ['ts:compile'], function () {
  var pattern = ['dist/{**,./}/*.spec.js'];
  if (args.test) {
    pattern = ['dist/{**,./}/' + args.test + '.spec.js'];
  }
  console.log('Running tests with pattern ' + args.test);
  return gulp.src(pattern).pipe(
    jasmine({
      verbose: true,
      includeStackTrace: true,
      config: {
        stopSpecOnExpectationFailure: false,
        random: false
      }
    })
  );
});

