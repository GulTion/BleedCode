const C2O = {'+':0,'-':1,'*':2,'/':3,'(':4,')':5,'^':6};
const O2C = ['+','-','*','/','(',')','^'];
const REM = 7;
const MAX_IDX = 31;

function calcDiff(s1, s2) {
    const l1 = s1.length;
    const l2 = s2.length;
    let i = 0;
    while (i < l1 && i < l2 && s1[i] === s2[i]) i++;
    
    if (i > MAX_IDX || (i === l1 && i === l2)) return null;

    let op = -1;
    const char2 = s2[i];

    if (i >= l2 || (i < l1 && l1 > l2 && s1.slice(i + 1) === s2.slice(i))) op = REM;
    else if (char2 !== undefined && char2 in C2O) op = C2O[char2];
    else return null;

    return (op << 5) | i;
}

function applyPatch(s1, byte) {
    if (byte === null || byte < 0 || byte > 255) return null;

    const op = byte >> 5;
    const idx = byte & MAX_IDX;
    const l1 = s1.length;

    if (op === REM) {
        if (idx >= l1) return null;
        return s1.slice(0, idx) + s1.slice(idx + 1);
    } else if (op < REM) {
        const charToUse = O2C[op];
        if (charToUse === undefined) return null;
        if (idx > l1) return null;
        return s1.slice(0, idx) + charToUse + s1.slice(idx);
    } else {
        return null;
    }
}



