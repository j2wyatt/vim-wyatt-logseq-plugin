import '@logseq/libs'
import conf from './config.js'
import {sleep} from "./tool";


// 注入方法
async function main() {
    // 本地存储
    // const item = await localStorage.getItem('vimWyatt')
    // if (!item) {
    //     await localStorage.setItem("vimWyatt", {pageReade: []})
    // }
    startKeyListen()
}

// start plugin
logseq.ready(main).catch(console.error)

var privateBind = conf.bindKey

// 命令模式标志
global.commandMode = false
// 双字母命令等待
global.waitAction = ''
// 锁定自定义键
global.noAction = false
// 剪切板
global.textBox = ''
// 重绘的阶段
global.reDrawLevel = 1
// 自定按键命令
var bindKey = []

async function startKeyListen() {
    await loadBindKey(privateBind)
    // 监听按键事件
    top.document.onkeydown = keyEventHandler
}


// 按键事件处理
async function keyEventHandler(e) {
    // 过滤单个修饰键
    const singleModify = await isSingleModifyKey(e)
    if (singleModify) {
    }
    // 锁定状态时按下 esc， 解除锁定
    else if (global.noAction && e.key == 'Escape') {
        await unLockAction()
    }
    // 解锁状态下识别键位
    else if (!global.noAction) {
        // 放行一下组合命令
        let composeKey = await isSysComplexKey(e)
        console.log(`${composeKey ? '系统按键' : '非系统按键'}: ${e.key}`)
        if (composeKey) {
            // 监测到系统按键，某些功能需要输入字符，锁定按键输入
            await lockActionBySys(e)
        } else {
            await privateKeyHandler(e)
        }
    }
}

// 整理命令定义
function loadBindKey(binds) {
    bindKey[0] = []
    bindKey[1] = []
    bindKey[2] = []
    for (let i = 0; i < binds.length; i++) {
        const bin = binds[i]
        bindKey[bin.type - 1].push(bin)
    }
}

// 判断是否是单个修饰键
async function isSingleModifyKey(e) {
    // 过滤单个修饰键
    let modifyKeySingle = (e.altKey && e.key == 'Alt') || (e.ctrlKey && e.key == 'Control')
        || (e.shiftKey && e.key == 'Shift') || (e.metaKey && e.key == 'Meta')
    return modifyKeySingle
}

// 解除对自定键位的锁定
async function unLockAction() {
    console.log('解除按键锁定')
    global.noAction = false
    // 进入命令模式
    global.commandMode = true
    await logseq.provideStyle(`
                    textarea {
                        caret-color: #ffcc00;
                    }
            `)
    await logseq.App.invokeExternalCommand("logseq.editor/up");
    // const page = await logseq.Editor.getCurrentPage()
    // await logseq.Editor.appendBlockInPage(page.name, '')
    // setTimeout(async () => {
    //     let blockUUID = await logseq.Editor.getCurrentBlock();
    //     console.log(blockUUID)
    // }, 1000)
}

// 过滤系统组合键
async function isSysComplexKey(e) {
    let composeKey = e.altKey || e.ctrlKey || e.shiftKey || e.metaKey
    const com = await privateComplexKey(e)
    composeKey = com ? composeKey : com
    return composeKey
}

// 放行修饰组合键
async function privateComplexKey(e) {
    const pares = bindKey[2]
    for (let i = 0; i < pares.length; i++) {
        const p = pares[i]
        // 匹配修饰键和字母键名字
        if (e[p.com] && e.key == p.key) {
            return false
        }
    }
    return true
}

// 因为某些系统命令需要输入，所以锁定自定按键
async function lockActionBySys(e) {
    // 监测到系统按键，某些功能需要输入字符，锁定按键输入
    if (false) {
        global.noAction = true
        console.log('锁定按键')
    }
}

// 进入命令模式
async function toCommandMode(e) {
    if (global.commandMode) {
        await lockActionForDoubleEsc(e)
    } else {
        await editModeTCommand(e)
    }
}

// 编辑模式进入命令模式
async function editModeTCommand(e) {
    e.preventDefault()
    global.commandMode = true
    let blockUUID = await logseq.Editor.getCurrentBlock();
    // 复现光标
    await logseq.Editor.editBlock(blockUUID.uuid);
    await logseq.provideStyle(`
                    textarea {
                        caret-color: #ffcc00;
                    }
            `)
    // 清空等待按键
    global.waitAction = ''
}

// 命令模式，重复 esc , 锁定自定按键
async function lockActionForDoubleEsc(e) {
    e.preventDefault()
    let blockUUID = await logseq.Editor.getCurrentBlock();
    // 进入无选择模式
    if (!blockUUID) {
        console.log('锁定按键')
        global.noAction = true
    }
}

// i 键，进入编辑模式
async function toEditModeByI(e) {
    global.commandMode = false
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
}

// 自定键处理
async function privateKeyHandler(e) {
    // 如果按了 esc 键，进入命令模式
    if (e.key == 'Escape') {
        await toCommandMode(e)
    }
    // 开始编辑模式
    else if (global.commandMode && e.key == 'i') {
        await toEditModeByI(e)
    } else {
        if (global.commandMode) {
            await commandModeHandler(e)
        } else {
            await editModespecialKey(e)
        }
    }
}

// 针对编辑模式的一些特殊按键
async function editModespecialKey(e) {
    // 阻止 tab 键，并输入四个空格
    if (e.key == 'Tab') {
        e.preventDefault()
        await logseq.Editor.insertAtEditingCursor('    ')
    }
}


// 处理命令模式的按键
async function commandModeHandler(e) {
    // 包含修饰键的组合命令
    const comMode = e.altKey || e.ctrlKey || e.shiftKey || e.metaKey
    // 命令模式会停止其余所有按键
    e.preventDefault()
    // 监听第二个字母
    if (global.waitAction != '') {
        await secondKeyHandler(e.key)
    } else if (comMode) {
        await comKeyHandler(e.key, e)
    } else {
        await firstKeyHandler(e.key, e)
    }
}

// 首按键监听
async function firstKeyHandler(key, e) {
    await sigleKeyHandler(key, e)
    await doubleKeyHandler(key, e)
}

// 单子母命令
async function sigleKeyHandler(key, e) {
    const singleBind = bindKey[0]
    for (let i = 0; i < singleBind.length; i++) {
        const bin = singleBind[i]
        if (key == bin.name) {
            await bin['fun'](key, e)
        }
    }
}

// 双字母命令
async function doubleKeyHandler(key, e) {
    const doubleKey = bindKey[1]
    for (let i = 0; i < doubleKey.length; i++) {
        const bin = doubleKey[i]
        if (key == bin.f) {
            await bin['take'](key, e)
        }
    }
}

// 修饰组装键命令
async function comKeyHandler(key, e) {
    const complexKey = bindKey[2]
    for (let i = 0; i < complexKey.length; i++) {
        const bin = complexKey[i]
        if (key == bin.key && e[bin.com]) {
            await bin['fun'](key, e)
        }
    }
}

// 处理多字母命令
async function secondKeyHandler(newAction) {
    let actionName = `${global.waitAction}${newAction}`
    const doubleKey = bindKey[1]
    for (let i = 0; i < doubleKey.length; i++) {
        const bin = doubleKey[i]
        if (actionName == bin.name) {
            await bin['fun']()
        }
    }
    global.waitAction = ''
}

//
// async function savePageRead() {
//     const page = await logseq.Editor.getCurrentPage()
//     const hideHeight = top.document.querySelector('#main-content-container').scrollTop
//     if (page && block) {
//         // 取得 scrollTop
//
//         // 更新 vimWyatt
//
//     }
// }
//
// async function startPageRead() {
//     while (true) {
//         await sleep(3000)
//         await savePageRead()
//     }
// }
