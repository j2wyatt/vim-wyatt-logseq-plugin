import '@logseq/libs'
import {sleep} from "./tool";
import {focusWord} from "./funs";

var readLock = false

// 功能增强
export async function startSmart() {
    await beginPageLocation()
    // await focusWord()
}

// 监听阅读位置
async function beginPageLocation() {
    await updateLocationEvent()
    await loadPageLocation()
}

async function updateLocationEvent() {
    // 本地存储
    const item = await localStorage.getItem('vimWyatt')
    if (!item) {
        await localStorage.setItem("vimWyatt", JSON.stringify({pageReade: {}}))
    }
    await updatePageLocaiton()
    setTimeout(async () => {
        await updateLocationEvent()
    }, 1000)
}

// 记录阅读位置
async function updatePageLocaiton() {
    const page = await logseq.Editor.getCurrentPage()
    const hideHeight = top.document.querySelector('#main-content-container').scrollTop
    if (page && hideHeight && !readLock) {
        // 更新 vimWyatt
        const confStr = await localStorage.getItem('vimWyatt')
        const conf = await JSON.parse(confStr)
        const id = page.id
        conf.pageReade[id.toString()] = hideHeight
        await localStorage.setItem('vimWyatt', JSON.stringify(conf))
    }
}

async function loadPageLocation() {
    logseq.App.onRouteChanged(() => {
        restorePageLocation()
    });
}

// 恢复阅读位置
async function restorePageLocation() {
    readLock = true
    const page = await logseq.Editor.getCurrentPage()
    if (page) {
        const confStr = await localStorage.getItem('vimWyatt')
        const conf = await JSON.parse(confStr)
        const id = page.id
        const hideHeight = conf.pageReade[id.toString()]
        const moveSize = 1000
        const pageCount = Math.ceil(hideHeight / moveSize)
        let scrollHeight = 0
        for (let i = 0; i < pageCount; i++) {
            scrollHeight += moveSize
            top.document.querySelector('#main-content-container').scrollTop = scrollHeight
            await sleep(100)
        }
        await sleep(200)
        top.document.querySelector('#main-content-container').scrollTop = hideHeight
    }
    readLock = false
}

// // 突出显识文字
// async function focusWord() {
//     const eleArray = top.document.querySelectorAll('#main-content-container .block-content span')
//     for (let i = 0; i < eleArray.length; i++) {
//         const ele = eleArray[i]
//         if (i == 0) {
//             ele.textContent = 'hello'
//             console.log(ele.textContent)
//         }
//     }
//
// }
