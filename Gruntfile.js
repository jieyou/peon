/*!
 * author:jieyou
 * see https://github.com/jieyou/peon
 */

module.exports = function(grunt){

    // 配置项目的路径
    var pathObj = {
        demoProjectA:'demoProjectA',
        demoProjectB:'demoProjectB/mobile',
        demoProjectC:'demoProjectC'
    }

    // 配置项目需要替换的静态文件的cdn地址前缀，如果无需替换，则没有对应字段
    // 示例中，只有demoProjectC项目需要替换
    var cdnPrefixObj = {
        demoProjectC:'http://7xjwxy.com2.z0.glb.qiniucdn.com/peon/demoProjectC/'
    }

    // 配置是否记录md5重命名的log
    var md5RenameMap = false

    // 配置删除debug代码相应标记
    var deleteDebugCodeMark = {
        start:'peon delete start',
        end:'peon delete end'
    }

    var deleteDebugCodeReg = {
        html:new RegExp('<\\!-- '+deleteDebugCodeMark.start+' -->(.|\\s)*?<\\!-- '+deleteDebugCodeMark.end+' -->', 'g'),
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

    var k,
        v,
        outputPath = '/dist',
        taskArr

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

    for(k in pathObj){
        if(pathObj.hasOwnProperty(k)){
            v = pathObj[k]
            initConfigObj.clean[k] = [v+outputPath],
            initConfigObj.copy[k] = {
                files:[
                    {
                        expand:true,
                        cwd: v,
                        src: '*.html',
                        dest: v+outputPath+'/'
                    },
                    {
                        expand:true,
                        cwd: v+'/others',
                        src: '**',
                        dest: v+outputPath+'/others'
                    },
                    {
                        expand:true,
                        cwd: v+'/lib',
                        src: '**',
                        dest: v+outputPath+'/lib'
                    },
                    {
                        expand:true,
                        cwd: v+'/css',
                        src: '*.css',
                        dest: v+outputPath+'/css'
                    },
                    {
                        expand:true,
                        cwd: v+'/js',
                        src: '*.js',
                        dest: v+outputPath+'/js'
                    },
                    {
                        expand:true,
                        cwd: v+'/images',
                        src: '*.{png,jpg,gif}',
                        dest: v+outputPath+'/images'
                    }                    
                ]
            }
            initConfigObj.replace[k + '___html___'] = {
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
                        cwd: v + outputPath + '/',
                        src: '*.html',
                        dest: v + outputPath + '/'
                    }
                ]
            }
            initConfigObj.replace[k + '___js___'] = {
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
                        cwd: v + outputPath + '/js',
                        src: '*.js',
                        dest: v + outputPath + '/js'
                    }
                ]
            }
            initConfigObj.replace[k+'___css___'] = {
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
                        cwd: v + outputPath + '/css',
                        src: '*.css',
                        dest: v + outputPath + '/css'
                    }
                ]
            }
            initConfigObj.uglify[k] = {
                files: [
                    {
                        expand:true,
                        cwd: v+outputPath+'/js',
                        src: '*.js',
                        dest: v+outputPath+'/js'
                    }
                ]
            }
            initConfigObj.cssmin[k] = {
                files: [
                    {
                        expand:true,
                        cwd: v+outputPath+'/css',
                        src: '*.css',
                        dest: v+outputPath+'/css'
                    }
                ]
            }
            initConfigObj.imagemin[k] = {
                files:[
                    {
                        expand:true,
                        cwd: v+outputPath+'/images',
                        src: '*.{png,jpg,gif}',
                        dest: v+outputPath+'/images'
                    }
                ]
            }

            // md5重命名所有图片
            initConfigObj.filerev[k+'___images___'] = {
                src: [v+outputPath+'/images/*.{png,jpg,gif}']
            }
            // k3karthic的代码可以解决原始代码中的问题
            // see https://github.com/salsita/grunt-userev/pull/7
            // see https://github.com/k3karthic/grunt-userev/blob/multiple_assets/tasks/userev.js
            // 修改css\js\html内的图片引用
            initConfigObj.userev[k+'___images___'] = {
                src: [v+outputPath+'/*.html',v+outputPath+'/css/*.css',v+outputPath+'/js/*.js']
            }

            if(md5RenameMap){
                // 记录md5命名映射log
                initConfigObj.filerev_assets[k+'___images___'] = {
                    options:{
                        cwd:v+outputPath,
                        dest:v+'/peon_md5_map/'+t+'___images___.json'
                    }
                }
            }
            // md5重命名所有js\css
            initConfigObj.filerev[k+'___js_css___'] = {
                src: [v+outputPath+'/css/*.css',v+outputPath+'/js/*.js']
            }
            // 修改html内的js\css引用（WIN）修改html内的js\css\图片[多做一次但是无所谓]引用（MAC）
            initConfigObj.userev[k+'___js_css___'] = {
                src: [v+outputPath+'/*.html']
            }

            if(md5RenameMap){
                // 记录md5命名映射log
                initConfigObj.filerev_assets[k+'___js_css___'] = {
                    options:{
                        cwd:v+outputPath,
                        dest:v+'/peon_md5_map/'+t+'___js_css___.json'
                    }
                }
            }

            if(cdnPrefixObj.hasOwnProperty(k)){
                initConfigObj.cdner[k] = {
                    options:{
                        // rewriter:function (url) {
                        //     // 示例中，分别为data:image、锚点、http(s)//、//开头的链接不修改
                        //     if (url.indexOf('data:') === 0 || /^\#?\{.*\}$/.test(url) || /^(https?\:)?\/\//i.test(url)){ // 无需修改为CDN地址的，以后可能还要添加，或者根据某个具体项目修改
                        //         return url
                            
                        //     }else{
                        //         return cdnPrefixObj[k] + url
                        //     }
                        // }
                        cdn:cdnPrefixObj[k],
                        root:v+outputPath
                        
                    },
                    files:[
                        {
                            expand:true,
                            cwd: v+outputPath,
                            src: ['css/*.css','js/*.js','*.html']//,'images/*.{png,jpg,gif}','others/*']
                            ,dest:v+outputPath
                        }
                    ]
                }
            }

            taskArr = [
                'clean:'+k,                         // 0
                'copy:'+k,                          // 1  
                'replace:'+k+'___html___',          // 2
                'replace:'+k+'___js___',            // 3
                'replace:'+k+'___css___',           // 4
                'uglify:'+k,                        // 5
                'cssmin:'+k,                        // 6
                'imagemin:'+k,                      // 7
                'filerev:'+k+'___images___',        // 8
                'userev:'+k+'___images___',         // 9
                // 'filerev_assets:'+k+'___images___', // d
                'filerev:'+k+'___js_css___',        // 10
                'userev:'+k+'___js_css___'          // 11
                // 'filerev_assets:'+k+'___js_css___',  // d
                // 'cdner:'+k                           // d
            ]

            if(md5RenameMap){
                taskArr.splice(10,0,'filerev_assets:'+k+'___images___')
                taskArr.splice(13,0,'filerev_assets:'+k+'___js_css___')
            }

            if(cdnPrefixObj.hasOwnProperty(k)){
                taskArr.splice(
                    (md5RenameMap?14:12)
                    ,0,'cdner:'+k)
            }

            grunt.registerTask(k,taskArr)
        }
    }

    grunt.initConfig(initConfigObj)
}