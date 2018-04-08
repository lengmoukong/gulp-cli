
let gulp = require('gulp');
let path   = require('path');
let fse    = require('fs-extra'); // 通过npm下载
let less = require('gulp-less');
let autoprefixer = require('gulp-autoprefixer');
let spritesmith = require('gulp.spritesmith-multi');
let merge  = require('merge-stream');
let concat = require('gulp-concat');
let browserSync = require('browser-sync').create();


//生成目录
// 获取当前文件路径
let PWD = process.env.PWD || process.cwd(); // 兼容windows

gulp.task('init', function() {

    var dirs = ['dist','dist/html','dist/css','dist/img','dist/js','src','src/less','src/js','src/img','src/pic','src/sprite','psd'];

    dirs.forEach(function (item,index) {
        // 使用mkdirSync方法新建文件夹
        fse.mkdirSync(path.join(PWD + '/'+ item));
    })

    // 往index里写入的基本内容
    var template = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/><title></title><meta name="apple-touch-fullscreen" content="yes" /><meta name="format-detection" content="telephone=no" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-status-bar-style" content="black" /></head><body></body></html>';

    fse.writeFileSync(path.join(PWD + '/dist/html/index.html'), template);
    fse.writeFileSync(path.join(PWD + '/src/less/style.less'), '@charset "utf-8";');
})


//编译less
gulp.task('less', function() {
   return  gulp.src('src/less/*.less') //该任务针对的文件
        .pipe(less()) //该任务调用的模块
        .pipe(gulp.dest('dist/css')); //将会在dist/css下生成index.css
});
// 加前缀
gulp.task('autoprefixer', function () {
    return gulp.src('dist/css/**/*.css')
        .pipe(autoprefixer({
            browsers: ['ios 5','android 2.3'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'));
});
//合并
gulp.task('concat', function() {
    return gulp.src('src/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
});

//合并生成雪碧图
gulp.task('sprite', function () {
    var spriteData = gulp.src('src/sprite/**/*.png')
        .pipe(spritesmith({
            spritesmith: function (options, sprite) {
                options.cssName = sprite + '.less';
                options.cssSpritesheetName = sprite;
            }
        }));
        var imgStream = spriteData.img
        .pipe(gulp.dest('dist/img'))

    var cssStream = spriteData.css
        .pipe(concat('sprite.less'))
        .pipe(gulp.dest('src/less'))
    return merge(imgStream, cssStream)
})
// 默认任务
gulp.task('default',function(){
    var files = [
        'dist/html/**/*.html',
        'dist/css/**/*.css',
        'src/js/**/*.js',
        'src/img/**/*.png'
    ]
    browserSync.init(files, {
        server: {
            baseDir: "./",
            directory: true
        },
        open: 'external',
        startPath: "dist/html/"
    });
    // 监听编译文件
    gulp.watch("dist/html/**/*.html").on('change', browserSync.reload);
    gulp.watch("src/less/**/*.less", ['less']);
    gulp.watch("src/img/**/*.png", ['sprite']);
    gulp.watch("dist/css/**/*.css", ['auimgtoprefixer']);

});
