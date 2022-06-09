import '@logseq/libs'
import {hotKeyEvent, sortBlock, getBlockById, getChildrenById} from './tool.js'


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
    const eleTree = await logseq.Editor.getCurrentPageBlocksTree()
    const block = eleTree[eleTree.length - 1]
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
    textBox = bb.content
    await logseq.App.invokeExternalCommand("logseq.editor/down");
    await logseq.Editor.removeBlock(bb.uuid)
}

export async function redo(key, e) {
    await logseq.App.invokeExternalCommand("logseq.editor/redo");
}

export async function paste(key, e) {
    let currentBlock = await logseq.Editor.getCurrentBlock()
    await logseq.Editor.insertBlock(currentBlock.uuid, textBox, {before: false})
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
        // 选中最后一个子块
        await logseq.Editor.editBlock(lastChildren.uuid, {
            pos: 0,
        });
    }
}
