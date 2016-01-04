# peon （苦力）

![peon](http://7xjwxy.com2.z0.glb.qiniucdn.com/images/peon.gif)

## 简单&通用的，基于grunt的“静态代码&图片压缩、文件md5重命名、自动替换重命名后的链接”前端工程化编译工具


使用peon可以搞定绝大多数前端工程化需求，如：

-   静态代码（js\\css）压缩
-   图片（gif\\png\\jpg）压缩
-   文件版本管理：对静态代码图片用md5求和，然后截取一定位数，写入到文件名中，这样不同版本的文件将拥有不同的文件名
-   在html、js、css中对上述文件的引用，替换为上一步重命名后的引用
-   将静态文件地址替换为CDN链接（添加前缀）
-   删除某些无需上线的代码行

本项目在MAC上开发，测试涵盖了MAC和WINDOWS

## 安装环境

### 安装nodejs

略

### 安装grunt-cli

打开命令行工具，键入： `npm install -g grunt-cli` 或参考 [Grunt getting
started](http://gruntjs.com/getting-started)

### 下载代码

* 点击右边`Download zip`按钮或 [此处](../../archive/master.zip) 下载代码
* 或者使用`git clone`来客隆仓库

### 安装依赖

- 将下载得到的代码，解压后拷贝到你项目所在路径上一层（如，你的项目根路径是
`~/Sites/aProject/` ，则解压到 `~/Sites/` ），运行 `npm i` （或`npm run install`）
- *(如果遇到错误，请尝试运行 `npm cache clear` ，然后再次运行 `npm i`)*

### 替换代码

* 运行 `npm run cpuserev`
* 或手动进行：用解压得到的代码根目录下的 `userev.js` 替换 `node_modules/grunt-userev/tasks` 下的同名文件

### 运行测试

- `grunt demoProjectA`（或`npm run testa`） 或 `grunt demoProjectB/mobile`（或`npm run testb`） 或 `grunt demoProjectC`（或`npm run testc`）
，然后进入你输入的相应的demoProject 查看和通过本地服务器访问 `dist/`
- 路径下的全部文件。即可测试编译demoProjectA或demoProjectB或demoProjectC内的代码，用来测试是否已经OK
- *（测试文件是从互联网上的素材网站下载和修改的，如果侵犯了作者权利请联系，会立即删除）*
  
## 处理你自己的项目

### 建立或拷贝项目

- 将你的项目置于demoProjectA的同级目录，假设你的项目名和路径是`myProject`
- 当然你也可以将peon拷贝到项目的上一级目录
- *（项目名称和路径均不能包含连续的三个“\_”（即“**\_”））*

### 按要求放置项目文件

进入你的项目的文件夹，如 `myProject/` ，按照demoProjectA的路径，开发你的项目，要求：

-   将*需要压缩*css文件置于 `css/` 文件夹下
-   将*需要压缩*的js文件置于 `js/` 文件夹下
-   将js\\css类库放在 `lib/` 文件夹下
-   将图片（目前只允许使用png\\gif\\jpg后缀名的）置于 `images/` 文件夹下
-   将其他无需压缩处理，但需要上线的文件放置于 `others/` 文件夹下
-   在目前，还需要确保需要压缩的css、js、图片的文件名中不包含中横线 `-`
-   在目前，还需要确保需要压缩的css和js之间没有相互引用

### 运行编译

- 运行 `grunt (+项目根目录相对路径)`，如 `grunt myProject`
- 会将全部处理后的文件置于 “ `dist/` ”的路径下

## 高级功能

### 将静态文件地址替换为CDN链接（给地址添加前缀）

在 `Gruntfile.js`中添加项目时，如果该项目需要将静态文件置于一个特殊的CDN服务器（即需要为修改代码中的静态文件增加一个域名前缀），则需要修改配置项`cdnPrefix`，此时被添加的cdn路径为`cdnPrefix + path`

有时候需要忽略`path`中的一部分路径。比如`path`为`h5/share`，但是只希望用`http://example.cdn.com/share`作为cdn路径的前缀，此时只需配置`ignoreCdnPathPrefix`为`h5/`即可

一般来说，并不是所有的静态文件都需要添加前缀，比如：

- `data:url`
- 绝对地址

### 删除无需上线的代码行（如调试代码）

你可以通过在

- html中使用`<!-- peon delete start -->`与`<!-- peon delete end -->`
- js和css中使用`/* peon delete start */`与`/* peon delete end */`

将无需上线的代码行包裹起来，这样在编译时会自动删除他们，你可以在`demoProjectA`项目中的

- `index.html`
- `js/script.js`
- `css/style.css`

里面看到示例。目前还没法支持在js中的`// peon delete start `这种写法，必须使用`/*`

当然你也可以通过修改配置项来更改他们

### 输出md5重命名前后的映射关系

- 将Gruntfile.js顶部的配置项`md5RenameMap`置为`true`即可开启
- md5改名前后的文件名关系映射，将生成并放在 `peon_md5_map/` 路径下，每次生成images的、css和js的各一个json文件，便于排查问题、增量上线等


## License

所有代码遵循 [MIT License]
。也就是说你可以自由地做任何你想做的事情，只是不能在代码中移除我的名字。

  [MIT License]: http://www.opensource.org/licenses/mit-license.php