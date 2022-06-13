import '@logseq/libs'
import {hotKeyEvent, sortBlock, getBlockById, getChildrenById, lastBlock, sleep, makeCharName} from './tool.js'
import {log} from "@logseq/libs/dist/postmate";
import pinyin from 'tiny-pinyin'

export async function down(key, e) {
    // 移动光标到下一行
    await logseq.App.invokeExternalCommand("logseq.editor/down");
}

export async function up(key, e) {
    await logseq.App.invokeExternalCommand("logseq.editor/up");
}

export async function right(key, e) {
    await logseq.App.invokeExternalCommand("logseq.editor/right");
}

export async function left(key, e) {
    if (!e.metaKey) {
        await logseq.App.invokeExternalCommand("logseq.editor/left");
    }
}

export async function forword(key, e) {
    // ctrl + shift + f
    await hotKeyEvent(top.document, 'keydown', 70, true, true);
}

export async function backword(key, e) {
    // ctrl + shift + b
    await hotKeyEvent(top.document, 'keydown', 66, true, true);
}

export async function beginOfBlock(key, e) {
    let blockUUID = await logseq.Editor.getCurrentBlock();
    await logseq.Editor.editBlock(blockUUID.uuid, {
        pos: 0,
    });
}

export async function editEndOfBlock(key, e) {
    global.commandMode = false
    console.log('进入编辑模式')
    await logseq.provideStyle(`
            textarea {
                caret-color: auto;
            }
        `)
    let blockUUID = await logseq.Editor.getCurrentBlock();
    await logseq.Editor.editBlock(blockUUID.uuid);
}

export async function editEndOfWord(key, e) {
    console.log('进入编辑模式')
    global.commandMode = false
    let pos = await logseq.Editor.getEditingCursorPosition()
    let currentBlock = await logseq.Editor.getCurrentBlock()
    if (pos) {
        await logseq.Editor.editBlock(currentBlock.uuid, {
            pos: pos.pos + 1,
        });
    } else {
        await logseq.Editor.editBlock(currentBlock.uuid);
    }
    await logseq.provideStyle(`
            textarea {
                caret-color: auto;
            }
        `)
}

export async function downHalfPage(key, e) {
    const page = await logseq.Editor.getCurrentPage()
    // 取得所有块元素
    let eleTree = await logseq.Editor.getCurrentPageBlocksTree()
    // 把下级元素取出来，排列成数组
    let uuidArray = await sortBlock(eleTree)
    // 查当前的块 uuid
    let currentBlock = await logseq.Editor.getCurrentBlock()
    let currentUUID = currentBlock.uuid
    // 用 uuid 取得数组下标
    let currentIndex = uuidArray.indexOf(currentUUID)
    // 下标后移几位，取得 uuid
    let newIndex = currentIndex + 10
    if (newIndex > uuidArray.length) newIndex = uuidArray.length - 1
    // 移动光标到此
    await logseq.Editor.editBlock(uuidArray[newIndex], {
        pos: 0,
    });
}

export async function upHalfPage(key, e) {
    const page = await logseq.Editor.getCurrentPage()
    // 取得所有块元素
    let eleTree = await logseq.Editor.getCurrentPageBlocksTree()
    // 把下级元素取出来，排列成数组
    let uuidArray = await sortBlock(eleTree)
    // 查当前的块 uuid
    let currentBlock = await logseq.Editor.getCurrentBlock()
    let currentUUID = currentBlock.uuid
    // 用 uuid 取得数组下标
    let currentIndex = uuidArray.indexOf(currentUUID)
    // 下标后移几位，取得 uuid
    let newIndex = currentIndex - 10
    if (newIndex < 0) newIndex = 0
    // 移动光标到此
    await logseq.Editor.editBlock(uuidArray[newIndex], {
        pos: 0,
    });
}

export async function beginOfPage(key, e) {
    const eleTree = await logseq.Editor.getCurrentPageBlocksTree()
    const block = eleTree[0]
    await logseq.Editor.editBlock(block.uuid, {
        pos: 0,
    });
}

export async function gTake(key, e) {
    // 等待下次按键
    global.waitAction = 'g'
    // 如果在块选择模式，恢复编辑状态，就不会识别成系统命令
    let currentBlock = await logseq.Editor.getCurrentBlock()
    if (currentBlock) {
        await logseq.Editor.editBlock(currentBlock.uuid, {
            pos: 0,
        });
    }
}

export async function endOfPage(key, e) {
    let eleTree = await logseq.Editor.getCurrentPageBlocksTree()
    const uuidArray = await sortBlock(eleTree)
    // 选择最后一个 bolock 的最后一个子元素
    let block = await lastBlock(eleTree)
    let lastBlockIndex = uuidArray.indexOf(block.uuid)
    // 选择有内容的块
    for (let i = 0; i < uuidArray.length; i++) {
        const uIndex = lastBlockIndex - i
        const mayEle = await logseq.Editor.getBlock(uuidArray[uIndex])
        if (mayEle.content != '') {
            block.uuid = uuidArray[uIndex]
            break;
        }
    }
    const contentId = `#block-content-${block.uuid}`
    const viewPos = top.document.querySelector('#main-content-container').scrollTop
    let newPos = viewPos + (31 * uuidArray.length)
    const halfHeight = Math.ceil(newPos / 2)
    for (let i = 0; i < 100; i++) {
        newPos += (i * halfHeight)
        top.document.querySelector('#main-content-container').scrollTop = newPos
        await sleep(100)
        const target = top.document.querySelector(contentId)
        if (target) {
            console.log('最后一个元素出现了')
            break;
        }
    }
    await logseq.Editor.editBlock(block.uuid, {
        pos: 0,
    });
}

export async function copyTake(key, e) {
    // 等待下次按键
    global.waitAction = 'y'
    // 如果在块选择模式，恢复编辑状态，就不会识别成系统命令
    let currentBlock = await logseq.Editor.getCurrentBlock()
    if (currentBlock) {
        await logseq.Editor.editBlock(currentBlock.uuid, {
            pos: 0,
        });
    }
}

export async function copyBlock(key, e) {
    const bb = await logseq.Editor.getCurrentBlock()
    global.textBox = bb.content
}

export async function forwordKillWord(key, e) {
    let caret = await logseq.Editor.getEditingCursorPosition()
    const block = await logseq.Editor.getCurrentBlock();
    if (block && caret) {
        await logseq.App.invokeExternalCommand("logseq.editor/right");
        await logseq.App.invokeExternalCommand("logseq.editor/cut");
    }
}

export async function undo(key, e) {
    await logseq.App.invokeExternalCommand("logseq.editor/undo");
}

export async function killTake(key, e) {
    // 等待下次按键
    global.waitAction = 'd'
    // 如果在块选择模式，恢复编辑状态，就不会识别成系统命令
    let currentBlock = await logseq.Editor.getCurrentBlock()
    if (currentBlock) {
        await logseq.Editor.editBlock(currentBlock.uuid, {
            pos: 0,
        });
    }
}

export async function killBlock(key, e) {
    const bb = await logseq.Editor.getCurrentBlock()
    global.textBox = bb.content
    await logseq.App.invokeExternalCommand("logseq.editor/down");
    await logseq.Editor.removeBlock(bb.uuid)
}

export async function redo(key, e) {
    await logseq.App.invokeExternalCommand("logseq.editor/redo");
}

export async function paste(key, e) {
    let currentBlock = await logseq.Editor.getCurrentBlock()
    await logseq.Editor.insertBlock(currentBlock.uuid, global.textBox, {before: false})
}

export async function newLine(key, e) {
    let pos = await logseq.Editor.getEditingCursorPosition()
    let currentBlock = await logseq.Editor.getCurrentBlock()
    if (pos) {
        const text = currentBlock.content + '\n'
        await logseq.Editor.updateBlock(currentBlock.uuid, text)
    } else {
        await logseq.Editor.editBlock(currentBlock.uuid);
        await logseq.Editor.insertAtEditingCursor('\n')
    }
    console.log('进入编辑模式')
    global.commandMode = false
    await logseq.provideStyle(`
              textarea {
                  caret-color: auto;
              }`)
}

export async function search(key, e) {
    global.noAction = true
    console.log('锁定按键')
    await logseq.App.invokeExternalCommand("logseq.go/search-in-page");
}

export async function toggleExpand(key, e) {
    let currentBlock = await logseq.Editor.getCurrentBlock()
    await logseq.Editor.setBlockCollapsed(currentBlock.uuid, 'toggle')
}

export async function newBlock(key, e) {
    global.commandMode = false
    console.log('进入编辑模式')
    await logseq.provideStyle(`
            textarea {
                caret-color: auto;
            }
        `)
    let blockUUID = await logseq.Editor.getCurrentBlock();
    await logseq.Editor.insertBlock(blockUUID.uuid, '', {sibling: true});
}


export async function goParentBlock(key, e) {
    // 查到所有块 id
    const eleTree = await logseq.Editor.getCurrentPageBlocksTree()
    const bb = await logseq.Editor.getCurrentBlock()
    const uuid = await getBlockById(eleTree, bb.parent.id)
    // 选中父块
    await logseq.Editor.editBlock(uuid, {
        pos: 0,
    });
}

export async function goBlockEndChild(key, e) {
    // 查到所有块 id
    const bb = await logseq.Editor.getCurrentBlock()
    if (bb.children.length > 0) {
        const eleTree = await logseq.Editor.getCurrentPageBlocksTree()
        const ch = await getChildrenById(eleTree, bb.id)
        const lastChildren = ch[ch.length - 1]
        console.log(lastChildren)
        // 选中最后一个子块
        await logseq.Editor.editBlock(lastChildren.uuid, {
            pos: 0,
        });
    }
}

export async function closeTab(key, e) {
    await hotKeyEvent(top.document, 'keydown', 87, false, true, true);
}

export async function zoomIn(key, e) {
    let blockUUID = await logseq.Editor.getCurrentBlock();
    await logseq.Editor.editBlock(blockUUID.uuid);
    await logseq.App.invokeExternalCommand("logseq.editor/zoom-in");
}

export async function zoomOut(key, e) {
    let blockUUID = await logseq.Editor.getCurrentBlock();
    await logseq.Editor.editBlock(blockUUID.uuid);
    await logseq.App.invokeExternalCommand("logseq.editor/zoom-out")
}

export async function reDraw(key, e) {
    if (global.reDrawLevel == 1) {
        global.reDrawLevel = 2
        await centerDraw(key, e)
    } else if (global.reDrawLevel == 2) {
        global.reDrawLevel = 3
        await topDraw(key, e)
    } else {
        global.reDrawLevel = 1
        await downDraw(key, e)
    }
}

async function currentBlockOffsetTop() {
    let block = await logseq.Editor.getCurrentBlock();
    const divId = `[blockid='${block.uuid}']`
    const div = top.document.querySelector(divId)
    // 相对于整体页面顶部的距离
    let offsetTop = div.offsetTop
    let parentDiv = div.offsetParent
    // 找到最上层父元素
    while (parentDiv.getAttribute('class') != 'relative') {
        parentDiv = parentDiv.offsetParent
        offsetTop += parentDiv.offsetTop
    }
    return offsetTop
}

// 当点块顶边垂直居中
async function centerDraw(key, e) {
    const viewHeight = top.document.querySelector('#main-content-container').clientHeight
    const centerHeight = Math.ceil(viewHeight / 2)
    const offsetTop = await currentBlockOffsetTop()
    // 两种特殊情况，距页顶不足一半视高，距页底不足一半视高
    if (offsetTop <= centerHeight) {
        return
    }
    const topHeight = offsetTop - centerHeight + 120
    top.document.querySelector('#main-content-container').scrollTop = topHeight
}

// 当前块顶部滚动至页面顶部
async function topDraw(key, e) {
    const offsetTop = await currentBlockOffsetTop()
    top.document.querySelector('#main-content-container').scrollTop = offsetTop + 50
}

// 当前块滚动至页面底部
async function downDraw(key, e) {
    const hideHeight = top.document.querySelector('#main-content-container').scrollTop
    const viewHeight = top.document.querySelector('#main-content-container').clientHeight
    const offsetTop = await currentBlockOffsetTop()
    const topHeight = hideHeight - (viewHeight - (offsetTop - hideHeight)) + 120
    top.document.querySelector('#main-content-container').scrollTop = topHeight
}

// 进入 jump mode
export async function jumpMode(key, e) {
    global.charJump = !global.charJump
    var hode = {
        key: 'vimwyatt-hode',
        template: `
        <div style="padding: 10px; overflow: auto;">
          <h3>hello</h3>
        </div>
      `,
        style: {
            left: '0px',
            top: '0px',
            width: '100%',
            height: '100%',
            border: '0px',
            background: 'rgba(0,0,0,.3)',
        },
    }
    let hodeStyle = `
        #vim-wyatt--vimwyatt-hode .draggable-handle{
            height: 0px;
        }
    `
    logseq.provideUI(hode)
    logseq.provideStyle(hodeStyle)
}

// 单字母匹配
export async function charJump(targetChar) {
    // 退出匹配模式
    if (targetChar == ';') {
        await exitJumpMode()
        return
    }
    // 进入选择模式
    if (global.jumpChar != '') {
        await charJumpMatch(targetChar)
        return
    }
    global.jumpChar = targetChar
    // 取得当前视口内的块元素
    const clientEle = await getClientEle()
    // 取得匹配的文字
    const partMeta = await filterPart(clientEle, targetChar)
    // 设置文字样式，分配字母标志
    await focusWord(partMeta)
}

// 突出显识文字
async function focusWord(partMeta) {
    let nameArray = await makeCharName()
    for (let i = 0; i < partMeta.length; i++) {
        const section = partMeta[i]
        const ele = top.document.querySelector(`#${section.blockid} .block-content span`)
        const bid = section.bid
        let contentIndex = 0
        let renderHtml = ''
        const block = await logseq.Editor.getBlock(bid)
        let content = block.content
        if (block.content.indexOf('\n:') > -1) {
            content = block.content.substring(0, block.content.indexOf('\n:'))
        }
        // 组装 html
        for (let s = 0; s < section.res.length; s++) {
            const name = nameArray.shift()
            const meta = section.res[s]
            const focusWord = meta.word
            let beginWord = content.substring(contentIndex, meta.index)
            renderHtml = `${renderHtml}${beginWord}` +
                `<span class="wyatt-jump-char" data-text="${focusWord}" data-pos="${meta.index}" data-bid="block-content-${bid}" style="background-color: #e52712; border-radius:5px;">${name}</span>`
            contentIndex = meta.index + 1
        }
        let endWord = content.substring(contentIndex)
        renderHtml += endWord
        ele.innerHTML = renderHtml
    }
}

// 取得当前视口内的块元素
async function getClientEle() {
    let clientEle = []
    const allEle = await top.document.querySelectorAll('.relative .page-blocks-inner .ls-block')
    const hideHeight = top.document.querySelector('#main-content-container').scrollTop
    const viewHeight = top.document.querySelector('#main-content-container').clientHeight
    for (let i = 0; i < allEle.length; i++) {
        const ele = await allEle[i]
        // 相对于整体页面顶部的距离
        let offsetTop = ele.offsetTop
        let parentDiv = ele.offsetParent
        // 找到最上层父元素
        while (parentDiv.getAttribute('class') != 'relative') {
            parentDiv = parentDiv.offsetParent
            offsetTop += parentDiv.offsetTop
        }
        // 块距页顶的高度 - 页面卷去的高度 = 块距视口顶的高度
        const offsetViewTop = offsetTop - hideHeight
        // 距视顶的高度 >0 && 距视顶的高度 < 视口高度
        if (offsetViewTop > 0 && offsetViewTop < viewHeight) {
            // 确定块在视口内
            const node = ele.querySelector('.block-content')
            if (node) {
                const blockId = await node.getAttribute('blockid')
                const block = await logseq.Editor.getBlock(blockId)
                let content = block.content
                // 忽略 org 属性
                if (block.content.indexOf('\n:') > -1) {
                    content = block.content.substring(0, block.content.indexOf('\n:'))
                }
                clientEle.push({id: ele.getAttribute('id'), bid: ele.getAttribute('blockid'), text: content})
            }
        }
    }
    return clientEle
}

// 筛选所有文字首字母
async function filterPart(clientEle, targetPart) {
    let partMeta = []
    for (let i = 0; i < clientEle.length; i++) {
        const txt = clientEle[i].text
        let section = {blockid: clientEle[i].id, bid: clientEle[i].bid, res: []}
        for (let s = 0; s < txt.length; s++) {
            const word = txt[s]
            // 确定每个字的首字母
            const part = await getWordBeginPart(word)
            if (part.toLowerCase() == targetPart) {
                // 筛选所有文字，匹配目标字母， 取得文字的位置
                let meta = {index: s, word: word, part: part}
                section.res.push(meta)
            }
        }
        if (section.res.length > 0) {
            partMeta.push(section)
        }
    }
    return partMeta
}

// 取得文字首字母
async function getWordBeginPart(word) {
    let pattern = ''
    const token = await pinyin.parse(word)
    if (token[0].type == 2) {
        pattern = token[0].target.substring(0, 1)
    } else {
        pattern = token[0].target
    }
    return pattern
}

// 退出 jump mode
async function exitJumpMode() {
    let node = top.document.querySelector('#vim-wyatt--vimwyatt-hode')
    if (node) {
        node.remove()
    }
    global.charJump = false
    global.jumpChar = ''
    global.matchChar = ''
    // 取消所有选中
    await cancelFocusAll()
}

// 字符选择模式
async function charJumpMatch(char) {
    console.log(`char ${char}`)
    let match = global.matchChar + char
    // 把没有这个字母的项目取消高亮，直到能确定唯一的项，把光标定位到那里
    const allEle = await top.document.querySelectorAll('.wyatt-jump-char')
    let matchRes = []
    for (let i = 0; i < allEle.length; i++) {
        let ele = allEle[i]
        const content = ele.textContent
        let reg = new RegExp(`^${match}.*`);
        if (reg.test(content.toLowerCase())) {
            matchRes.push(ele)
        } else {
            await cancelFocusWord(ele)
        }
    }
    if (matchRes.length == 1) {
        console.log('找到了')
        let node = matchRes[0]
        await cancelFocusWord(node)
        // 定位
        const bid = node.dataset.bid.replace('block-content-', '')
        await logseq.Editor.editBlock(bid, {pos: node.dataset.pos})
        const page = await logseq.Editor.getCurrentPageBlocksTree()
        // 退出
        await exitJumpMode()
    } else {
        global.matchChar = match
    }
}

// 取消高亮
async function cancelFocusWord(ele) {
    const word = ele.dataset.text
    const bid = ele.dataset.bid
    const pos = ele.dataset.pos
    const text = ele.dataset.text
    const name = ele.textContent
    // 使用字符串头匹配，替换成原来的字
    let regNode = new RegExp(`<span class="wyatt-jump-char" data-text="${text}" data-pos="${pos}" data-bid="${bid}" style="background-color: #e52712; border-radius:5px;">${name}</span>`);
    // 取父元素，重设 innerHTML
    const parent = await top.document.querySelector(`#${bid} span[class="inline"]`)
    let parentHtml = parent.innerHTML
    // 恢复原来的文字
    let newHtml = parentHtml.replace(regNode, word)
    parent.innerHTML = newHtml
}

// 取消所有字符高亮
async function cancelFocusAll() {
    const allEle = await top.document.querySelectorAll('.wyatt-jump-char')
    for (let i = 0; i < allEle.length; i++) {
        let ele = allEle[i]
        await cancelFocusWord(ele)
    }
}
