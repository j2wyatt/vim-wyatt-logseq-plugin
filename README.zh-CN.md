# vim-wyatt-logseq-plugin
这个插件的目的是让 logseq 拥有 vim 一样的编辑体验

![功能展示](./public/demo.gif "happy hacking")
## 支持的键位
- `j` 向下移动光标
- `k` 向上移动光标
- 具体内容都在这里 `src/config`
  ![配置](./public/config.jpg "happy hacking")
- 目前的键位对我来说应该已经够了，您要是有需求的话可以自定义
## 启动方式
- clone 本项目
- npm install
- npm run build
- 在 logseq 里手动载入插件，直接选择项目根目录即可
## 画重点
- 目前只有在本地通过 Load unpacked plugin 的方式加载插件，才能访问到 top 引用。
- 如果没有 logseq 团队已经发布的 api，我是不可能做到这些的
## 来由
一直以来，我都是使用 emacs 来写东西的，emacs + evil 的配合让我写字变成一种享受。 神器用久了也是会腻的，这时候 logseq 进入了我的视野，所以我就想换换口味。
但是 logseq 一个没有类似 vim 的编辑体验，这一直阻碍着我使用 logseq。

本来我想着一天没有这个功能，我就一天不用它（说明一直在暗暗关注着人家）。 然后有一天我看到了 logseq-plugin-vim-shortcuts 这个插件，想着终于可以入坑了。
然后发现我还是太年轻了，它不能移动光标。但是这位开发者给了我勇气，我试着自己来实现。

目前算是实现了一些主要功能，我完全可以入坑 logseq 了。也希望它能帮到你们 happy hacking!

## 主要原理
```js
// 监听主页面的按键输入
top.document.onkeydown = async function (e) {
  console.log(e)

  // 阻止按键在文本框输入字符,然后识别成命令
  e.preventDefault()

  // 在按下 esc 键后,因为没有拦截到它,所以光标还是消失了
  let blockUUID = await logseq.Editor.getCurrentBlock();
  // 现在使用这个方法,重新进入编辑模式,它会复现光标
  await logseq.Editor.editBlock(blockUUID.uuid);
}
```
要点就是 top 这个对象,根据我了解它有这样的缺憾.
- 发布在市场中的 Logseq 插件默认情况是运行在独立域名中的 iframe 沙盒里，所以访问
- 主视图 top 引用（指向到主视图的 window 对象）的能力被跨域安全策略禁止.
- 目前只有在本地通过 Load unpacked plugin 的方式加载插件，才能访问到 top 引用。
- 因为用的不是 api,所以稳定性存疑
- 这个缺憾我也没有试过，我不打算发布它到市场，大家喜欢的话可以自己做，这就是我开源它的目的。 毕竟要是已经有这样的插件，我也不用自己写了。

## 感谢
- logseq
- logseq-plugin-vim-shortcuts

## Licence
MIT
