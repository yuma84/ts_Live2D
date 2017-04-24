"use strict";

const fs = require( "fs-extra" );
const del = require( "del" );
const run = require( "run-sequence" );
const gulp = require( "gulp" );
const plumber = require( "gulp-plumber" );
const watch = require( "gulp-watch" );
const ts = require( "gulp-typescript" );
const web = require( "gulp-webserver" );

const PATH = {
    root: "./dest",
    src: "./src",
    ts: "ts",
    js: "js",
    assets: "assets"
};

gulp.task( "mkdest", () => {
    fs.mkdirsSync( PATH.root );
} );

gulp.task( "clean", [ "mkdest" ], del.bind( null, [ PATH.root ] ) );

gulp.task( "html", [ "mkdest" ], ( callback ) => {
    gulp.src( [ PATH.src, "**/*.html" ].join( "/" ) )
        .pipe( plumber() )
        .pipe( gulp.dest( PATH.root ) )
        .on( "end", () => callback() );
} );

gulp.task( "ts", [ "mkdest" ], () => {
    const project = ts.createProject( "tsconfig.json", { declaration: false } );
    return project.src()
        .pipe( plumber() )
        .pipe( project() )
        .pipe( gulp.dest( [ PATH.root, PATH.js ].join( "/" ) ) );
} );

gulp.task( "js", [ "mkdest" ], () => {
    return gulp.src( [ PATH.src, PATH.js, "*.js" ].join( "/" ) )
        .pipe( plumber() )
        .pipe( gulp.dest( [ PATH.root, PATH.js ].join( "/" ) ) );
} );

gulp.task( "assets", [ "mkdest" ], () => {
    return gulp.src( [ PATH.src, PATH.assets, "**/*" ].join( "/" ) )
        .pipe( plumber() )
        .pipe( gulp.dest( [ PATH.root, PATH.assets ].join( "/" ) ) );
} );

gulp.task( "build", ( callback ) => {
    return run( "clean", [ "ts", "js", "html", "assets" ], callback );
} );

gulp.task( "watch", [ "build" ], () => {
    watch( [ PATH.src, PATH.ts, "**/*" ].join( "/" ), () => gulp.start( "ts" ) );
    watch( [ PATH.src, PATH.assets, "**/*" ].join( "/" ), () => gulp.start( "assets" ) );
    watch( [ PATH.src, PATH.js, "**/*" ].join( "/" ), () => gulp.start( "js" ) );
    watch( [ PATH.src, "**/*.html" ].join( "/" ), () => gulp.start( "html" ) );
} );

gulp.task( "web", [ "watch" ], () => {
    gulp.src( PATH.root )
        .pipe( web( {
            livereload: true,
            open: true,
            port: 8000
        } ) );
} );

gulp.task( "default", [ "build" ] );
