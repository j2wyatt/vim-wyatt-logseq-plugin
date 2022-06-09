import '@logseq/libs'
import {log} from "@logseq/libs/dist/postmate";


// 注入方法
async function main() {
    tryListen()
}

// 命令模式标志
var commandMode = false
// 双字母命令等待
var waitAction = ''
// 锁定自定义键
var noAction = false
// 剪切板
var textBox = ''

function tryListen() {
    // 监听按键事件
    top.document.onkeydown = listenKeyEvent
}

async function listenKeyEvent(e) {
    // 过滤单个修饰键
    let modifyKeySingle = (e.altKey && e.key == 'Alt') || (e.ctrlKey && e.key == 'Control')
        || (e.shiftKey && e.key == 'Shift') || (e.metaKey && e.key == 'Meta')
    if (modifyKeySingle) {
    }
    // 解除锁定
    else if (noAction && e.key == 'Escape') {
        console.log('解除按键锁定')
        noAction = false
        // 进入命令模式
        commandMode = true
        await logseq.provideStyle(`
                    textarea {
                        caret-color: #ffcc00;
                    }
            `)
        await logseq.App.invokeExternalCommand("logseq.editor/down");
    }
    // 继续监听
    else if (!noAction) {
        // 这里放行一下组合命令
        let composeKey = e.altKey || e.ctrlKey || e.shiftKey || e.metaKey
        if (e.shiftKey && e.key == 'A') {
            composeKey = false
        }
        if (e.shiftKey && e.key == 'G') {
            composeKey = false
        }
        if (e.ctrlKey && e.key == 'r') {
            composeKey = false
        }
        if (e.altKey && e.key == 'Enter') {
            composeKey = false
        }
        console.log(`${composeKey ? '系统按键' : '非系统按键'}: ${e.key}`)
        // 还需要深入判断
        if (!composeKey) {
            await stopKey(e)
        } else {
            // 监测到系统按键，某些功能需要输入字符，锁定按键输入
            if (false) {
                noAction = true
                console.log('锁定按键')
            }
        }
    }
}

async function stopKey(e) {
    // 如果按了 esc 键，进入命令模式
    if (e.key == 'Escape') {
        // 命令模式，重复触发情况
        if (commandMode) {
            e.preventDefault()
            let blockUUID = await logseq.Editor.getCurrentBlock();
            // 进入无选择模式
            if (!blockUUID) {
                console.log('锁定按键')
                noAction = true
            }
        }
        // 编辑模式进入命令模式
        else {
            e.preventDefault()
            commandMode = true
            let blockUUID = await logseq.Editor.getCurrentBlock();
            // 复现光标
            await logseq.Editor.editBlock(blockUUID.uuid);
            await logseq.provideStyle(`
                    textarea {
                        caret-color: #ffcc00;
                    }
            `)
            // 清空等待按键
            waitAction = ''
        }
    }
    // 开始编辑模式
    else if (commandMode && e.key == 'i') {
        commandMode = false
        e.preventDefault()
        let pos = await logseq.Editor.getEditingCursorPosition()
        await logseq.provideStyle(`
            textarea {
                caret-color: auto;
            }
        `)
        let blockUUID = await logseq.Editor.getCurrentBlock();
        await logseq.Editor.editBlock(blockUUID.uuid, {
            pos: pos ? pos.pos : 0,
        });
    } else {
        // 命令模式会停止其余所有按键
        if (commandMode) {
            // console.log(`识别成自定义按键: ${e.key}`)
            e.preventDefault()
            // 监听第二个字母
            if (waitAction != '') {
                await taskDoubleAction(e.key)
            }
            // 单子母命令
            else {
                await loadEditKey(e.key, e)
            }
        }
        // 针对编辑模式的一些特殊按键
        else {
            // 阻止 tab 键，并输入四个空格
            if (e.key == 'Tab') {
                e.preventDefault()
                await logseq.Editor.insertAtEditingCursor('    ')
            }
        }
    }
}

async function loadEditKey(key, e) {
    if (key == 'j') {
        // 移动光标到下一行
        await logseq.App.invokeExternalCommand("logseq.editor/down");
    }
    if (key == 'k') {
        await logseq.App.invokeExternalCommand("logseq.editor/up");
    }
    if (key == 'l') {
        await logseq.App.invokeExternalCommand("logseq.editor/right");
    }
    if (key == 'h' && !e.metaKey) {
        await logseq.App.invokeExternalCommand("logseq.editor/left");
    }
    if (key == 'w') {
        // ctrl + shift + f
        await hotKeyEvent(top.document, 'keydown', 70, true, true);
    }
    if (key == 'b') {
        // ctrl + shift + b
        await hotKeyEvent(top.document, 'keydown', 66, true, true);
    }
    if (key == '0') {
        let blockUUID = await logseq.Editor.getCurrentBlock();
        await logseq.Editor.editBlock(blockUUID.uuid, {
            pos: 0,
        });
    }
    if (key == 'A' && e.shiftKey) {
        commandMode = false
        console.log('进入编辑模式')
        await logseq.provideStyle(`
            textarea {
                caret-color: auto;
            }
        `)
        let blockUUID = await logseq.Editor.getCurrentBlock();
        await logseq.Editor.editBlock(blockUUID.uuid);
    }
    if (key == 'a') {
        console.log('进入编辑模式')
        commandMode = false
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
    if (key == 'f') {
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
    if (key == 't') {
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
    if (key == 'g') {
        // 等待下次按键
        waitAction = 'g'
        // 如果在块选择模式，恢复编辑状态，就不会识别成系统命令
        let currentBlock = await logseq.Editor.getCurrentBlock()
        if (currentBlock) {
            await logseq.Editor.editBlock(currentBlock.uuid, {
                pos: 0,
            });
        }
    }
    if (key == 'G' && e.shiftKey) {
        const eleTree = await logseq.Editor.getCurrentPageBlocksTree()
        const block = eleTree[eleTree.length - 1]
        await logseq.Editor.editBlock(block.uuid, {
            pos: 0,
        });
    }
    if (key == 'y') {
        // 等待下次按键
        waitAction = 'y'
        // 如果在块选择模式，恢复编辑状态，就不会识别成系统命令
        let currentBlock = await logseq.Editor.getCurrentBlock()
        if (currentBlock) {
            await logseq.Editor.editBlock(currentBlock.uuid, {
                pos: 0,
            });
        }
    }
    if (key == 'x') {
        let caret = await logseq.Editor.getEditingCursorPosition()
        const block = await logseq.Editor.getCurrentBlock();
        if (block && caret) {
            await logseq.App.invokeExternalCommand("logseq.editor/right");
            await logseq.App.invokeExternalCommand("logseq.editor/cut");
        }
    }
    if (key == 'u') {
        await logseq.App.invokeExternalCommand("logseq.editor/undo");
    }
    if (key == 'd') {
        // 等待下次按键
        waitAction = 'd'
        // 如果在块选择模式，恢复编辑状态，就不会识别成系统命令
        let currentBlock = await logseq.Editor.getCurrentBlock()
        if (currentBlock) {
            await logseq.Editor.editBlock(currentBlock.uuid, {
                pos: 0,
            });
        }
    }
    if (key == 'r' && e.ctrlKey) {
        await logseq.App.invokeExternalCommand("logseq.editor/redo");
    }
    if (key == 'p') {
        let currentBlock = await logseq.Editor.getCurrentBlock()
        await logseq.Editor.insertBlock(currentBlock.uuid, textBox, {before: false})
    }
    if (key == 'o') {
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
        commandMode = false
        await logseq.provideStyle(`
              textarea {
                  caret-color: auto;
              }`)
    }
    if (key == '/') {
        noAction = true
        console.log('锁定按键')
        await logseq.App.invokeExternalCommand("logseq.go/search-in-page");
    }
    if (key == 'Tab') {
        let currentBlock = await logseq.Editor.getCurrentBlock()
        await logseq.Editor.setBlockCollapsed(currentBlock.uuid, 'toggle')
    }
    if (key == 'Enter' && e.altKey) {
        commandMode = false
        console.log('进入编辑模式')
        await logseq.provideStyle(`
            textarea {
                caret-color: auto;
            }
        `)
        let blockUUID = await logseq.Editor.getCurrentBlock();
        await logseq.Editor.insertBlock(blockUUID.uuid, '', {sibling: true});
    }
}

// 触发指定快捷键
function hotKeyEvent(el, evtType, keyCode, ctrlKey, shiftKey, metaKey) {
    var evtObj;
    //chrome 浏览器下模拟事件
    evtObj = document.createEvent('UIEvents');
    evtObj.initUIEvent(evtType, true, true, window, 1);
    delete evtObj.keyCode;
    //为了模拟keycode
    if (typeof evtObj.keyCode === "undefined") {
        Object.defineProperty(evtObj, "keyCode", {value: keyCode});
    } else {
        evtObj.key = String.fromCharCode(keyCode);
    }
    //为了模拟 ctrl 键
    if (typeof evtObj.ctrlKey === 'undefined') {
        Object.defineProperty(evtObj, "ctrlKey", {value: ctrlKey});
    } else {
        evtObj.ctrlKey = ctrlKey;
    }
    //为了模拟 shift 键
    if (typeof evtObj.shiftKey === 'undefined') {
        Object.defineProperty(evtObj, "shiftKey", {value: shiftKey});
    } else {
        evtObj.shiftKey = shiftKey;
    }
    //为了模拟 metaKey 键
    if (typeof evtObj.metaKey === 'undefined') {
        Object.defineProperty(evtObj, "metaKey", {value: metaKey});
    } else {
        evtObj.metaKey = shiftKey;
    }
    el.dispatchEvent(evtObj);
}

// 把块元素排序组成数组
async function sortBlock(eleTree) {
    let uuidArray = []
    for (let i = 0; i < eleTree.length; i++) {
        const ele = eleTree[i]
        uuidArray.push(ele.uuid)
        // 把下级元素取出来，排列成数组
        if (ele.children.length > 0) {
            // 如果一个下级元素被折叠了，那么就不放入数组
            if (!ele['collapsed?']) {
                let child = await sortBlock(ele.children)
                uuidArray.push.apply(uuidArray, child);
            }
        }
    }
    return uuidArray
}

// 把元素树的 id 转成数组
async function getBlockById(eleTree, id) {
    for (let i = 0; i < eleTree.length; i++) {
        const ele = eleTree[i]
        if (ele.id == id) {
            return ele.uuid
        }
        // 把下级元素取出来
        if (ele.children.length > 0) {
            // 如果一个下级元素被折叠了，就忽略它
            if (!ele['collapsed?']) {
                let childUUid = await getBlockById(ele.children, id)
                if (childUUid) {
                    return childUUid
                }
            }
        }
    }
}

// 根据 id 查到元素的子块
async function getChildrenById(eleTree, id) {
    for (let i = 0; i < eleTree.length; i++) {
        const ele = eleTree[i]
        if (ele.id == id) {
            return ele.children
        }
        // 把下级元素取出来
        if (ele.children.length > 0) {
            // 如果一个下级元素被折叠了，就忽略它
            if (!ele['collapsed?']) {
                let children = await getChildrenById(ele.children, id)
                if (children && children.length > 0) {
                    return children
                }
            }
        }
    }
}

// 处理多字母命令
async function taskDoubleAction(newAction) {
    let actionName = `${waitAction}${newAction}`
    if (actionName == 'gg') {
        const eleTree = await logseq.Editor.getCurrentPageBlocksTree()
        const block = eleTree[0]
        await logseq.Editor.editBlock(block.uuid, {
            pos: 0,
        });
    } else if (actionName == 'gf') {
        // 查到所有块 id
        const eleTree = await logseq.Editor.getCurrentPageBlocksTree()
        const bb = await logseq.Editor.getCurrentBlock()
        const uuid = await getBlockById(eleTree, bb.parent.id)
        // 选中父块
        await logseq.Editor.editBlock(uuid, {
            pos: 0,
        });
    } else if (actionName == 'gh') {
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
    } else if (actionName == 'yy') {
        const bb = await logseq.Editor.getCurrentBlock()
        textBox = bb.content
    } else if (actionName == 'dd') {
        const bb = await logseq.Editor.getCurrentBlock()
        textBox = bb.content
        await logseq.App.invokeExternalCommand("logseq.editor/down");
        await logseq.Editor.removeBlock(bb.uuid)
    } else {
        console.log(`找不到按键命令： ${actionName}`)
    }
    waitAction = ''
}


logseq.ready(main).catch(console.error)
