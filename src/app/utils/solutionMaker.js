import { _121212 } from "./_121212.js";

const EPSILON = 1e-9;

function generateExpressionsRecursive(digits, start, end) {
    let results = [];
 
    

    if (start === end) {
        results.push({ expr: String(digits[start]), value: Number(digits[start]) });
        return results;
    }

    let currentNumVal = 0;
    let currentNumStr = "";
    for (let i = start; i <= end; ++i) {
        currentNumVal = currentNumVal * 10.0 + digits[i];
        currentNumStr += String(digits[i]);
    }
    results.push({ expr: currentNumStr, value: currentNumVal });

    for (let k = start; k < end; ++k) {
        const leftResults = generateExpressionsRecursive(digits, start, k);
        const rightResults = generateExpressionsRecursive(digits, k + 1, end);

        for (const left of leftResults) {
            for (const right of rightResults) {
                results.push({ expr: `(${left.expr}+${right.expr})`, value: left.value + right.value });
                results.push({ expr: `(${left.expr}-${right.expr})`, value: left.value - right.value });
                results.push({ expr: `(${left.expr}*${right.expr})`, value: left.value * right.value });

                if (Math.abs(right.value) > EPSILON) {
                    results.push({ expr: `(${left.expr}/${right.expr})`, value: left.value / right.value });
                }

                try {
                    const powResult = Math.pow(left.value, right.value);
                    if (Number.isFinite(powResult)) {
                        results.push({ expr: `(${left.expr}^${right.expr})`, value: powResult });
                    }
                } catch (e) {
                   // console.error(`Warning: Error during Math.pow(${left.value}, ${right.value}): ${e}`);
                }
            }
        }
        
        
    }
    return results;
}

function removeOuterBrackets(str) {
  if (str && str.length >= 2 && str.startsWith('(') && str.endsWith(')')) {
    return str.slice(1, -1);
  }
  return str;
}
export function findHundredSolutions(digits) {
    if (!Array.isArray(digits) || digits.length !== 6) {
        console.error("Invalid input: Input must be an array of 6 numbers.");
        return [];
    }
    if (!digits.every(d => Number.isInteger(d) && d >= 1 && d <= 9)) {
         console.error("Invalid input: All elements must be integers between 1 and 9.");
         return [];
    }

    const allPossible = generateExpressionsRecursive(digits, 0, 5);
    const solutions = new Set();

    for (const res of allPossible) {
        if (Math.abs(res.value - 100.0) < EPSILON) {
            solutions.add(res.expr);
        }
    }

    return Array.from(solutions).map(e=>removeOuterBrackets(e));
}

export const godLevelSolution = (allSolutions)=>{
    let m=99, s=0;
    for(let i=0;i<allSolutions.length;++i){
        if(allSolutions[i].length<m){
            m=allSolutions[i].length;
   
        }
    }

    m=99;
    for(let i=0;i<allSolutions.length;++i){
        if(allSolutions[i].length==m){
            m=allSolutions[i].length;
            s=i;
        }
    }

    return allSolutions[s];
}

console.log(godLevelSolution(findHundredSolutions([1,2,1,1,1,2])))


/**
 * Counts the number of non-digit characters (operators, parentheses)
 * in an expression string, given the original sequence of digits.
 *
 * @param {string} expressionString - The expression (e.g., "(1+23)*4").
 * @param {string} originalDigitsString - The original digits in sequence (e.g., "1234").
 * @returns {number} The count of non-digit characters, or -1 if the digits
 *                   in the expression don't match the original sequence.
 */
function countBreaks(expressionString, originalDigitsString) {
    let digitPointer = 0; // Pointer for originalDigitsString
    let breakCount = 0;
  
    for (let i = 0; i < expressionString.length; i++) {
      const char = expressionString[i];
  
      // Check if we still expect digits from the original string
      if (digitPointer < originalDigitsString.length) {
        // If the current expression char matches the expected digit
        if (char === originalDigitsString[digitPointer]) {
          digitPointer++; // Move to the next expected digit
        } else {
          // It's not the expected digit, so it must be a break character
          breakCount++;
        }
      } else {
        // All original digits have been matched, any remaining chars are breaks
        breakCount++;
      }
    }
  
    // Validation: Ensure all original digits were actually found in order
    if (digitPointer === originalDigitsString.length) {
      return breakCount;
    } else {
      // Should not happen if expressionString was generated correctly,
      // but good for robustness.
      console.warn(`Warning: Digits in expression "${expressionString}" do not seem to match original digits "${originalDigitsString}" in order.`);
      return -1; // Indicate an issue
    }
  }
  
  /**
   * Finds the "best" solution from a list based on two criteria:
   * 1. Shortest expression length (primary).
   * 2. Fewest "breaks" (operators/parentheses) as a tie-breaker.
   *
   * @param {string[]} allSolutions - An array of valid expression strings.
   * @param {string} originalDigitsString - The original string of digits used
   *                                       to generate the solutions (e.g., "123456").
   * @returns {string | null} The best solution string, or null if allSolutions is empty.
   */
 export function findBestSolution(allSolutions, originalDigitsString) {
    if (!allSolutions || allSolutions.length === 0) {
      return null; // No solutions to choose from
    }
  
    let bestSolution = allSolutions[0];
    let shortestLength = bestSolution.length;
    let minBreakCount = countBreaks(bestSolution, originalDigitsString);
  
    // Start loop from the second element
    for (let i = 1; i < allSolutions.length; i++) {
      const currentSolution = allSolutions[i];
      const currentLength = currentSolution.length;
  
      // Primary Criterion: Check length
      if (currentLength < shortestLength) {
        // Found a shorter solution, it's the new best
        shortestLength = currentLength;
        bestSolution = currentSolution;
        minBreakCount = countBreaks(currentSolution, originalDigitsString);
      } else if (currentLength === shortestLength) {
        // Secondary Criterion (Tie-breaker): Check breaks
        const currentBreakCount = countBreaks(currentSolution, originalDigitsString);
  
        // Check if counts are valid and if current has fewer breaks
        if (currentBreakCount !== -1 && currentBreakCount < minBreakCount) {
           // Same length, but fewer breaks, so it's the new best
           bestSolution = currentSolution;
           minBreakCount = currentBreakCount;
           // shortestLength remains the same
        }
         // If break counts are equal, we keep the one found first (or based on stability if needed)
      }
      // If currentLength > shortestLength, do nothing
    }
  
    return bestSolution;
  }
  
  
// const best = findBestSolution(findHundredSolutions([1,1,1,1,1,2]), "111112");
