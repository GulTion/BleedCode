import { _121212 } from "./_121212.js";
import { _state } from "./_state.js";
import { solutionCanExist } from "./solutionForState.js";

export const progressGraph=(allSolutions, states)=>{
let progress = 0.0;
return states.map(((e,i)=>{
    // console.log(solutionCanExist(allSolutions, e.state).length);
    
    if(solutionCanExist(allSolutions, e.state).length>0){
        progress=Math.min(progress+20, 80);
        // progress+=0.2
    }else{
        progress=0;
    }

    if(i==states.length-1) progress=100;
    return ({...e, progress})
}))
}

console.log(progressGraph(_121212, _state));
