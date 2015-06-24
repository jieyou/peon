# peon （苦力）

![peon](http://7xjwxy.com2.z0.glb.qiniucdn.com/images/peon.gif)

## 简单&通用的，基于grunt的“静态代码&图片压缩、文件md5重命名、自动替换重命名后的链接”前端工程化编译工具


使用peon可以搞定绝大多数前端工程化需求，如：

-   静态代码（js\\css）压缩
-   图片（gif\\png\\jpg）压缩
-   文件重命名：对静态代码图片用md5求和，然后截取一定位数，写入到文件名中
-   在html、js、css中对上述文件的引用，替换为上一步重命名后的引用
-   将静态文件地址替换为CDN链接（添加前缀）

本项目在MAC上开发，测试涵盖了MAC和WINDOWS

## 安装环境

### 安装nodejs

略

### 安装grunt-cli

打开命令行工具，键入： `npm install -g grunt-cli` 或参考 [Grunt getting
started](http://gruntjs.com/getting-started)

### 下载代码

点击右边“Download zip”按钮或 [此处](../../archive/master.zip) 下载代码

### 安装依赖

- 将下载得到的代码，解压后拷贝到你项目所在路径上一层（如，你的项目根路径是
`~\Sites\aProject\` ，则解压到 `~\Sites\` ），运行 `npm i`
- *(如果遇到错误，请尝试运行 `npm cache clear` ，然后再次运行 `npm i`)*

### 替换代码

用解压得到的代码根目录下的 `userev.js` 替换 `node_modules/grunt-userev/tasks` 下的同名文件

### 运行测试

- `grunt demoProjectA` 或 `grunt demoProjectB` 或 `grunt demoProjectC`
，然后进入你输入的相应的demoProject 查看和通过本地服务器访问 `dist/`
- 路径下的全部文件。即可测试编译demoProjectA或demoProjectB或demoProjectC内的代码，用来测试是否已经OK
- *（测试文件是从互联网上的素材网站下载和修改的，如果侵犯了作者权利请联系，会立即删除）*
  
## 处理你自己的项目

### 建立或拷贝项目

- 将你的项目置于demoProjectA的同级目录，假设你的项目名和路径是`myProject`
- 当然你也可以将peon拷贝到项目的上一级目录
- *（项目名称和路径均不能包含连续的三个“\_”（即“**\_”））*

### 按要求放置项目文件

进入 `myProject/` 按照demoProjectA的路径，开发你的项目，要求：

-   将*需要压缩*css文件置于 `css/` 文件夹下
-   将*需要压缩*的js文件置于 `js/` 文件夹下
-   将js\\css类库放在 `lib/` 文件夹下
-   将图片（目前只允许使用png\\gif\\jpg后缀名的）置于 `images/` 文件夹下
-   将其他无需压缩处理，但需要上线的文件放置于 `others/` 文件夹下
-   在目前，还需要确保需要压缩的css、js、图片的文件名中不包含中横线 `-`
-   在目前，还需要确保需要压缩的css和js之间没有相互引用

### 在 `Gruntfile.js` 中添加项目

打开 `Gruntfile.js` 在最顶部的 `pathObj`
对象中，加上你的项目名（key）和路径（value），添加完以后的例子：

    var pathObj = {
        demoProjectA:'demoProjectA',
        demoProjectB:'demoProjectB/mobile',
        demoProjectC:'demoProjectC',
        myProject:'myProject'
    }

你也可以直接修改demoProjectA或demoProjectB所在行

### 运行

- 运行， `grunt myProject`
- 会将全部处理后的文件置于 “ `dist/` ”的路径下
- md5改名前后的文件名关系隐射，将生成并放在 `peon_md5_map/` 路径下，每次生成images的、css和js的各一个json文件，便于排查问题、增量上线等

## 新功能

### 将静态文件地址替换为CDN链接（添加前缀）

在 `Gruntfile.js`
中添加项目时，如果该项目需要将静态文件置于一个特殊的CDN服务器（即需要为修改代码中的静态文件增加一个域名前缀），则需要在配置
`pathObj` 中的字段的同时，配置 `cdnPrefixObj` ，字段名与 `pathObj`
中的相同，值为对应需要为静态文件添加的前缀

    var cdnPrefixObj = {
        demoProjectC:'http://7xjwxy.com2.z0.glb.qiniucdn.com/peon/demoProjectC/', // 这是我的示例，请无视具体地址
        myProject:'http://cdn.example.com/myProject/' // 请注意最后的“/”
    }

一般来说，并不是所有的静态文件都需要添加前缀（比如 `data:url`
或绝对地址），在具体项目中，你可能需要更改不用添加前缀的静态文件的过滤器，那么请搜索 `rewriter:function` ，然后修改相关代码

## TODO

- userev的npm发布
- 支持编译AMD体系的脚本（或托管给r.js？）
- 解决css、js、图片的文件名不能包含中横线 `-` 的问题
- 支持被压缩的js和css的相互引用
- 按某个特定注释标记，删除标记之间的代码

## License

所有代码遵循 [MIT License]
。也就是说你可以自由地做任何你想做的事情，只是不能在代码中移除我的名字。

  [MIT License]: http://www.opensource.org/licenses/mit-license.php