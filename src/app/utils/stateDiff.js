const C2O = {'+':0,'-':1,'*':2,'/':3,'(':4,')':5,'^':6};
const O2C = ['+','-','*','/','(',')','^'];
const REM = 7;
const MAX_IDX = 31;

export function calcDiff(s1, s2) {
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

export function applyPatch(s1, byte) {
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

export function stateMakerFromDiff(digits,stateDiff){
let s = digits.join("");
let res = [];
// res.push({state:s});
for(let i=0;i<stateDiff.length;++i){
    s= applyPatch(s, stateDiff[i]);
    res.push({state:s});
}
return res;
}

// let state = [
//     "121212",
//     "12-1212",
//     "12-121^2",
//     "12-12+1^2",
//     "1+2-12+1^2",
//     "1+2-12+1)^2",
//     "1+2-(12+1)^2",
//     "1+2-(12+1))^2",
//     "1+(2-(12+1))^2",
//     "1+(2-(12+1)))^2",
//     "(1+(2-(12+1)))^2",
//     "(1+(2-(12+1)))^2)",
//     "((1+(2-(12+1)))^2)"];
    

export function stateDiffMakerFromState(digits,state){
let res = [];
for(let i=1;i<state.length;++i){
    res.push(calcDiff(state[i-1], state[i]));
}
return res;
}
// console.log(stateDiffMakerFromState([1,2,1,2,1,2], state));

// console.log(stateMakerFromDiff([1,2,1,2,1,2], [
//     34, 198,   5,   1, 168,
//    132, 170, 130, 172, 128,
//    176, 129
//  ]));