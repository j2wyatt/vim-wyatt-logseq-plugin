import '@logseq/libs'
import {hotKeyEvent, sortBlock, getBlockById, getChildrenById, lastBlock, sleep} from './tool.js'
import {log} from "@logseq/libs/dist/postmate";


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

export async function forward(key, e) {
    // ctrl + shift + f
    await hotKeyEvent(top.document, 'keydown', 70, true, true);
}

export async function backward(key, e) {
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

export async function editEndOfWard(key, e) {
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
    let newIndex = currentIndex + 5
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
    let newIndex = currentIndex - 5
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

export async function forwardKillWard(key, e) {
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
    const hideHeight = top.document.querySelector('#main-content-container').scrollTop
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
