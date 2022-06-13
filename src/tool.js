// 触发指定快捷键
export function hotKeyEvent(el, evtType, keyCode, ctrlKey, shiftKey, metaKey) {
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
export async function sortBlock(eleTree) {
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
export async function getBlockById(eleTree, id) {
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
export async function getChildrenById(eleTree, id) {
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

// 选择 block 树的最后一个元素
export async function lastBlock(eleTree) {
    for (let i = 0; i < eleTree.length; i++) {
        const ele = eleTree[eleTree.length - 1]
        if (ele.children.length > 0) {
            if (ele['collapsed?']) {
                return ele
            } else {
                const child = await lastBlock(ele.children)
                return child
            }
        } else {
            return ele
        }
    }
}

export function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


export async function makeCharName() {
    let a = await one()
    let b = await two()
    let c = await three()
    let res = a.concat(b).concat(c)
    return res
}

// 一位
function one() {
    let res = []
    let section = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < section.length; i++) {
        res.push(section[i])
    }
    return res
}

// 两位
function two() {
    let res = []
    let section = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < section.length; i++) {
        for (let s = 0; s < section.length; s++) {
            const word = section[i] + section[s]
            res.push(word)
        }
    }
    return res
}


// 三位
function three() {
    let res = []
    let section = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < section.length; i++) {
        for (let s = 0; s < section.length; s++) {
            for (let a = 0; a < section.length; a++) {
                const word = section[i] + section[s] + section[a]
                res.push(word)
            }
        }
    }
    return res
}
