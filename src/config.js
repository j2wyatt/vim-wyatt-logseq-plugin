import * as f from './funs'

// 1 单键，2 双字母键，3 修饰加字母键
var bindKey = [
    {name: 'j', type: 1, fun: f.down},
    {name: 'k', type: 1, fun: f.up},
    {name: 'l', type: 1, fun: f.right},
    {name: 'h', type: 1, fun: f.left},
    {name: 'w', type: 1, fun: f.forward},
    {name: 'b', type: 1, fun: f.backward},
    {name: '0', type: 1, fun: f.beginOfBlock},
    {name: 'S-A', type: 3, com: 'shiftKey', key: 'A', fun: f.editEndOfBlock},
    {name: 'a', type: 1, fun: f.editEndOfWard},
    {name: 'f', type: 1, fun: f.downHalfPage},
    {name: 't', type: 1, fun: f.upHalfPage},
    {name: 'gg', type: 2, f: 'g', s: 'g', take: f.gTake, fun: f.beginOfPage},
    {name: 'gf', type: 2, f: 'g', s: 'f', take: f.gTake, fun: f.goParentBlock},
    {name: 'gh', type: 2, f: 'g', s: 'h', take: f.gTake, fun: f.goBlockEndChild},
    {name: 'S-G', type: 3, com: 'shiftKey', key: 'G', fun: f.endOfPage},
    {name: 'yy', type: 2, f: 'y', s: 'y', take: f.copyTake, fun: f.copyBlock},
    {name: 'x', type: 1, fun: f.forwardKillWard},
    {name: 'u', type: 1, fun: f.undo},
    {name: 'dd', type: 2, f: 'd', s: 'd', take: f.killTake, fun: f.killBlock},
    {name: 'C-r', type: 3, com: 'ctrlKey', key: 'r', fun: f.redo},
    {name: 'p', type: 1, fun: f.paste},
    {name: 'o', type: 1, fun: f.newLine},
    {name: '/', type: 1, fun: f.search},
    {name: 'Tab', type: 1, fun: f.toggleExpand},
    {name: 'A-Enter', type: 3, com: 'altKey', key: 'Enter', fun: f.newBlock},
]


export default {
    bindKey
}

