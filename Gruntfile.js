/*!
 * author:jieyou
 * contacts:baidu hi->youyo1122
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

    var t = grunt.template.date(new Date(),'yyyy-mm-dd_HH-MM-ss'),
        banner = '/*! built by `peon` (https://github.com/jieyou/peon) */'

    var initConfigObj = {
        pkg: grunt.file.readJSON('package.json'),
        clean:{},
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
        copy:{},
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
        cdnify:{     
        }
    }

    var k,
        v,
        outputPath = '/dist',
        taskArr

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-cssmin')
    grunt.loadNpmTasks('grunt-contrib-imagemin')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-filerev')
    grunt.loadNpmTasks('grunt-userev')
    grunt.loadNpmTasks('grunt-filerev-assets')
    grunt.loadNpmTasks('grunt-cdnify')

    for(k in pathObj){
        if(pathObj.hasOwnProperty(k)){
            v = pathObj[k]
            initConfigObj.clean[k] = [v+outputPath],
            initConfigObj.uglify[k] = {
                files: [
                    {
                        expand:true,
                        cwd: v+'/js',
                        src: '*.js',
                        dest: v+outputPath+'/js'
                    }
                ]
            }
            initConfigObj.cssmin[k] = {
                files: [
                    {
                        expand:true,
                        cwd: v+'/css',
                        src: '*.css',
                        dest: v+outputPath+'/css'
                    }
                ]
            }
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
                    }
                    // 图片可能没有必要保留未压缩版本，将imagemin后的覆盖原文件
                    // ,
                    // {
                    //     expand:true,
                    //     cwd: v+outputPath+'/images',
                    //     src: '*.{png,jpg,gif}',
                    //     dest: v+'/images'
                    // }
                    // windows机器上imagemin有问题，移除，只是将图片拷贝到output
                    // ,
                    // {
                    //     expand:true,
                    //     cwd: v+'/images',
                    //     src: '*.{png,jpg,gif}',
                    //     dest: v+outputPath+'/images'
                    // }
                ]
            }
            initConfigObj.imagemin[k] = {
                files:[
                    {
                        expand:true,
                        cwd: v+'/images',
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
            // 记录md5命名映射logo
            initConfigObj.filerev_assets[k+'___images___'] = {
                options:{
                    cwd:v+outputPath,
                    dest:v+'/peon_md5_map/'+t+'___images___.json'
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
            // 记录md5命名映射logo
            initConfigObj.filerev_assets[k+'___js_css___'] = {
                options:{
                    cwd:v+outputPath,
                    dest:v+'/peon_md5_map/'+t+'___js_css___.json'
                }
            }

            if(cdnPrefixObj.hasOwnProperty(k)){
                initConfigObj.cdnify[k] = {
                    options:{
                        rewriter:function (url) {
                            // 示例中，分别为data:image、锚点、http(s)//、//开头的链接不修改
                            if (url.indexOf('data:') === 0 || /^\#?\{.*\}$/.test(url) || /^(https?\:)?\/\//i.test(url)){ // 无需修改为CDN地址的，以后可能还要添加，或者根据某个具体项目修改
                                return url
                            
                            }else{
                                return cdnPrefixObj[k] + url
                            }
                        }
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
                'clean:'+k,
                'uglify:'+k,
                'cssmin:'+k,
                'imagemin:'+k,
                'copy:'+k,
                'filerev:'+k+'___images___',
                'userev:'+k+'___images___',
                'filerev_assets:'+k+'___images___',
                'filerev:'+k+'___js_css___',
                'userev:'+k+'___js_css___',
                'filerev_assets:'+k+'___js_css___'
            ]

            if(cdnPrefixObj.hasOwnProperty(k)){
                taskArr.splice(10,0,'cdnify:'+k)
            }

            grunt.registerTask(k,taskArr)
        }
    }

    grunt.initConfig(initConfigObj)
}