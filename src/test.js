function makeButton() {
    logseq.provideStyle(`
    .openIconName {
      width: 18px;
      height: 18px;
      margin: 2px 0.4em 0 0.4em;
      background-color: blue;
      border-radius: 4px;
      border: 1px solid #eee;
    }
  `);

    logseq.provideModel({
        async wyattCS() {
            // logseq.App.showMsg(`Hello! wyatt`);
            console.log('click')
            // const root = await logseq.App.queryElementById('root')
            // console.log(root)
            // root.addEventListener('keyup', keyEvent)
        }
    })

    logseq.App.registerUIItem("toolbar", {
        key: "show-plugin-open",
        template: `
            <a data-on-click="wyattCS">
              <div class="openIconName"></div>
            </a>
          `
    });
}


function keyEvent(e) {
    console.log(e)
}


// function setCursorPosition(elem, index) {
//     var val = elem.value
//     var len = val.length
//
//     // 超过文本长度直接返回
//     if (len < index) return
//     setTimeout(function() {
//         elem.focus()
//         if (elem.setSelectionRange) { // 标准浏览器
//             elem.setSelectionRange(index, index)
//         } else { // IE9-
//             var range = elem.createTextRange()
//             range.moveStart("character", -len)
//             range.moveEnd("character", -len)
//             range.moveStart("character", index)
//             range.moveEnd("character", 0)
//             range.select()
//         }
//     }, 10)
// }


// let c = await logseq.Editor.getCurrentBlock()
// let a = await logseq.Editor.getPageBlocksTree()
// let v = await logseq.Editor.getEditingCursorPosition()
// let t = await logseq.Editor.getCurrentPageBlocksTree()
// console.log(c)
// console.log(a)
// console.log(v)
// console.log(t)
// scrollToBlockInPage


// const viewHeight = top.document.querySelector('#main-content-container').clientHeight
// const viewPos = top.document.querySelector('#main-content-container').scrollTop
// const newPos = viewPos + (viewHeight / 2)
// top.document.querySelector('#main-content-container').scrollTop=newPos
//


