# vim-wyatt-logseq-plugin
The purpose of this plugin is to give logseq a vim-like editing experience


Chinese document [README.zh-CN.md](https://github.com/j-wyatt-a/vim-wyatt-logseq-plugin/blob/main/README.zh-CN.md "Chinese version")

Direct decompression version [compressed package](https://github.com/j-wyatt-a/vim-wyatt-logseq-plugin/releases/download/1.1.0/vim-wyatt-logseq-plugin.zip )

![Function Show](./public/demo.gif "happy hacking")
## Supported keys
- `j` moves the cursor down
- `k` moves the cursor up
- `C-l` redraw
- ; char jump mode
- The specific content is here `src/config`
  ![config](./public/config.jpg "happy hacking")
- The current key position should be enough for me, you can customize it if you need it
## start method
- clone this project
- npm install
- npm run build
- Manually load the plugin in logseq, just select the project root directory directly

## draw the focus
- I couldn't have done this without the api that the logseq team has released
- The purpose of publishing plug-ins is to attract others, hoping to see better vim plug-ins

## Origin
I have always used emacs to write things, and the combination of emacs + evil makes my writing a pleasure. The artifact will get tired after using it for a long time. At this time, logseq came into my field of vision, so I wanted to change my taste.
But logseq does not have a vim-like editing experience, which has been preventing me from using logseq.

Originally, I thought that without this function for a day, I would not use it for a day (indicating that I have been paying attention to others secretly). Then one day I saw the plugin logseq-plugin-vim-shortcuts and thought that I could finally get into the pit.
Then found out that I was still too young to move the cursor. But this developer gave me the courage to try to implement it myself.

At present, some main functions have been realized, and I can completely enter the pit logseq. Hope it helps you happy hacking too!

## Main principle
````js
// Monitor the key input of the main page
top.document.onkeydown = async function (e) {
  console.log(e)

  // Prevent keys from entering characters in the text box, and then recognize them as commands
  e.preventDefault()

  // After pressing the esc key, the cursor still disappears because it is not intercepted
  let blockUUID = await logseq.Editor.getCurrentBlock();
  // Now use this method to re-enter edit mode, it will reproduce the cursor
  await logseq.Editor.editBlock(blockUUID.uuid);
}
````

## grateful
- logseq
- logseq-plugin-vim-shortcuts

## Licence
MIT
