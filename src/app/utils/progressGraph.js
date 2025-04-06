import { _121212 } from "./_121212.js";
import { _state } from "./_state.js";
import { solutionCanExist } from "./solutionForState.js";
const evaluateExpression = (expression) => {
    console.warn("Using placeholder evaluateExpression. Replace with a safe evaluator.");
    if (!expression) return { value: null, error: null };
    try {
      // Allow whitespace and replace ^ with ** for exponentiation
      const sanitized = expression
        .replace(/[^-()\d/*+.^\s]/g, '') // Allow valid characters
        .replace(/\^/g, '**'); // Replace ^ with ** for JavaScript
      const result = new Function(`return ${sanitized}`)();
      if (typeof result !== 'number' || !isFinite(result)) {
        return { value: null, error: 'Invalid calculation result' };
      }
      return { value: result, error: null };
    } catch (error) {
      console.error("Evaluation Error:", error);
      return { value: null, error: error.message || 'Invalid expression syntax' };
    }
  };
export const progressGraph=(allSolutions, states)=>{
let progress = 0.0;
return states.map(((e,i)=>{
    // console.log(solutionCanExist(allSolutions, e.state).length);
    let solutions = solutionCanExist(allSolutions, e.state)
    if(solutions.length>0){
        progress=Math.min(progress+20, 80);
        // progress+=0.2
    }else{
        progress=0;
    }

    if(evaluateExpression(e).value==100) progress=100;
    
    return ({...e, progress,solutions})
}))
}
