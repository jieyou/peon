/*!
 * author:jieyou
 * see https://github.com/jieyou/peon
 */

module.exports = function(grunt){

    // 配置cdn前缀
    // 为空字符串则不进行cdn地址的更换操作
    var cdnPrefix = 'http://cdn.chitu.cn/'

    // 实际的cdn前缀是这样组成的：cdnPrefix + （path需要删掉的开头的部分）
    // 在这里配置`path需要删掉的开头的部分`
    // 为空字符串则不进行删除
    var deletePathPrefixForCdnPrefix = 'h5/'

    // 配置是否记录md5重命名的log
    var md5RenameMap = false

    // 配置删除debug代码的相应开头、结尾标记
    var deleteDebugCodeMark = {
        start:'peon delete start',
        end:'peon delete end'
    }

    // 配置编译哦输出的相对路径
    // 此路径相对于项目的根目录，而不是Gruntfile.js所在目录，通常情况下需要前面的`/`
    var outputPath = '/dist'
    
    // 配置项完毕

    var path = process.argv[2]
    var removeLastSlashPath
    if(path){
        // 去掉最后一个 `/`
        if(path[path.length-1] == '/'){
            removeLastSlashPath = path.substr(0,path.length-1)
        }else{
            removeLastSlashPath = path
        }
    }else{
        grunt.fail.warn('请将项目路径由参数带过来')
        return
    }

    var deleteDebugCodeReg = {
        html:new RegExp('<\\!-- '+ deleteDebugCodeMark.start + ' -->(.|\\s)*?<\\!-- ' + deleteDebugCodeMark.end + ' -->', 'g'),
        css:new RegExp('/\\* ' + deleteDebugCodeMark.start + ' \\*/(.|\\s)*?/\\* ' + deleteDebugCodeMark.end + ' \\*/', 'g'),
        js:new RegExp('/\\* ' + deleteDebugCodeMark.start + ' \\*/(.|\\s)*?/\\* ' + deleteDebugCodeMark.end + ' \\*/', 'g') // todo: 支持js “//” 的注释
    }

    var t = grunt.template.date(new Date(),'yyyy-mm-dd_HH-MM-ss'),
        banner = '/*! built by `peon` (https://github.com/jieyou/peon) */'

    var initConfigObj = {
        pkg: grunt.file.readJSON('package.json'),
        clean:{},
        copy:{},
        replace:{},
        uglify:{
            options:{
                banner:banner+'\n',
                preserveComments:'some' // 保留代码中 “!” 开头的注释，如 /*! */之间的
            }
        },
        cssmin:{
            options:{
                banner:banner
                // ,keepSpecialComments:'*' // （默认即为）保留代码中 “!” 开头的注释，如 /*! */之间的
            }
        },
        imagemin:{},
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 8
            }
        },
        userev: {
            options: {
                hash: /(\.[a-f0-9]{8})\.[a-z]+$/,
                patterns: {
                    'versioned assets css': /(css\/[\w.]+\.css)/ig,
                    'versioned assets js': /(js\/[\w.]+\.js)/ig
                    ,'versioned assets images': /(images\/[\w.]+\.(png|jpg|gif))/ig
                }
            }
        },
        filerev_assets:{
            options:{
                prettyPrint:true
            }
        },
        cdner:{}
    }

    var taskArr

    initConfigObj.clean[path] = [path + outputPath],
    initConfigObj.copy[path] = {
        files:[
            {
                expand:true,
                cwd: removeLastSlashPath , 
                src: '*.html',
                dest: removeLastSlashPath + outputPath+'/'
            },
            {
                expand:true,
                cwd: removeLastSlashPath + '/others',
                src: '**',
                dest: removeLastSlashPath + outputPath+'/others'
            },
            {
                expand:true,
                cwd: removeLastSlashPath + '/lib',
                src: '**',
                dest: removeLastSlashPath + outputPath+'/lib'
            },
            {
                expand:true,
                cwd: removeLastSlashPath + '/css',
                src: '*.css',
                dest: removeLastSlashPath + outputPath+'/css'
            },
            {
                expand:true,
                cwd: removeLastSlashPath + '/js',
                src: '*.js',
                dest: removeLastSlashPath + outputPath+'/js'
            },
            {
                expand:true,
                cwd: removeLastSlashPath + '/images',
                src: '*.{png,jpg,gif}',
                dest: removeLastSlashPath + outputPath+'/images'
            }                    
        ]
    }
    initConfigObj.replace[path + '___html___'] = {
        options: {
            patterns: [
                {
                    match: deleteDebugCodeReg.html,
                    replacement: ''
                }
            ]
        },
        files: [
            {
                expand: true,
                cwd: removeLastSlashPath   + outputPath + '/',
                src: '*.html',
                dest: removeLastSlashPath   + outputPath + '/'
            }
        ]
    }
    initConfigObj.replace[path + '___js___'] = {
        options: {
            patterns: [
                {
                    match: deleteDebugCodeReg.js,
                    replacement: ''
                }
            ]
        },
        files: [
            {
                expand: true,
                cwd: removeLastSlashPath + outputPath + '/js',
                src: '*.js',
                dest: removeLastSlashPath + outputPath + '/js'
            }
        ]
    }
    initConfigObj.replace[path+'___css___'] = {
        options: {
            patterns: [
                {
                    match: deleteDebugCodeReg.css,
                    replacement: ''
                }
            ]
        },
        files: [
            {
                expand:true,
                cwd: removeLastSlashPath + outputPath + '/css',
                src: '*.css',
                dest: removeLastSlashPath + outputPath + '/css'
            }
        ]
    }
    initConfigObj.uglify[path] = {
        files: [
            {
                expand:true,
                cwd: removeLastSlashPath + outputPath+'/js',
                src: '*.js',
                dest: removeLastSlashPath + outputPath+'/js'
            }
        ]
    }
    initConfigObj.cssmin[path] = {
        files: [
            {
                expand:true,
                cwd: removeLastSlashPath + outputPath+'/css',
                src: '*.css',
                dest: removeLastSlashPath + outputPath+'/css'
            }
        ]
    }
    initConfigObj.imagemin[path] = {
        files:[
            {
                expand:true,
                cwd: removeLastSlashPath + outputPath+'/images',
                src: '*.{png,jpg,gif}',
                dest: removeLastSlashPath + outputPath+'/images'
            }
        ]
    }

    // md5重命名所有图片
    initConfigObj.filerev[path+'___images___'] = {
        src: [removeLastSlashPath + outputPath+'/images/*.{png,jpg,gif}']
    }
    // k3karthic的代码可以解决原始代码中的问题
    // see https://github.com/salsita/grunt-userev/pull/7
    // see https://github.com/k3karthic/grunt-userev/blob/multiple_assets/tasks/userev.js
    // 修改css\js\html内的图片引用
    initConfigObj.userev[path+'___images___'] = {
        src: [removeLastSlashPath + outputPath+'/*.html',removeLastSlashPath + outputPath+'/css/*.css',removeLastSlashPath + outputPath+'/js/*.js']
    }

    if(md5RenameMap){
        // 记录md5命名映射log
        initConfigObj.filerev_assets[path+'___images___'] = {
            options:{
                cwd:removeLastSlashPath + outputPath,
                dest:removeLastSlashPath + '/peon_md5_map/'+t+'___images___.json'
            }
        }
    }
    // md5重命名所有js\css
    initConfigObj.filerev[path+'___js_css___'] = {
        src: [removeLastSlashPath + outputPath+'/css/*.css',removeLastSlashPath + outputPath+'/js/*.js']
    }
    // 修改html内的js\css引用（WIN）修改html内的js\css\图片[多做一次但是无所谓]引用（MAC）
    initConfigObj.userev[path+'___js_css___'] = {
        src: [removeLastSlashPath + outputPath+'/*.html']
    }

    if(md5RenameMap){
        // 记录md5命名映射log
        initConfigObj.filerev_assets[path+'___js_css___'] = {
            options:{
                cwd:removeLastSlashPath + outputPath,
                dest:removeLastSlashPath + '/peon_md5_map/'+t+'___js_css___.json'
            }
        }
    }

    if(cdnPrefix){
        initConfigObj.cdner[path] = {
            options:{
                cdn:cdnPrefix + (deletePathPrefixForCdnPrefix ? removeLastSlashPath.replace(deletePathPrefixForCdnPrefix,'') : ''),
                root:removeLastSlashPath + outputPath
            },
            files:[
                {
                    expand:true,
                    cwd: removeLastSlashPath + outputPath,
                    src: ['css/*.css','js/*.js','*.html']//,'images/*.{png,jpg,gif}','others/*']
                    ,dest:removeLastSlashPath + outputPath
                }
            ]
        }
    }

    taskArr = [
        'clean:'+path,                         // 0
        'copy:'+path,                          // 1  
        'replace:'+path+'___html___',          // 2
        'replace:'+path+'___js___',            // 3
        'replace:'+path+'___css___',           // 4
        'uglify:'+path,                        // 5
        'cssmin:'+path,                        // 6
        'imagemin:'+path,                      // 7
        'filerev:'+path+'___images___',        // 8
        'userev:'+path+'___images___',         // 9
        // 'filerev_assets:'+path+'___images___', // d
        'filerev:'+path+'___js_css___',        // 10
        'userev:'+path+'___js_css___'          // 11
        // 'filerev_assets:'+path+'___js_css___',  // d
        // 'cdner:'+path                           // d
    ]

    if(md5RenameMap){
        taskArr.splice(10,0,'filerev_assets:'+path+'___images___')
        taskArr.splice(13,0,'filerev_assets:'+path+'___js_css___')
    }

    if(cdnPrefix){
        taskArr.splice(
            (md5RenameMap?14:12)
            ,0,'cdner:'+path)
    }

    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-replace')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-imagemin')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-filerev')
    grunt.loadNpmTasks('grunt-userev')
    grunt.loadNpmTasks('grunt-filerev-assets')
    grunt.loadNpmTasks('grunt-cdner')

    grunt.registerTask(path,taskArr)

    grunt.initConfig(initConfigObj)
}