import { _121212 } from "./_121212.js";

function countOperatorsNeeded(string1, string2) {
    let i = 0; // Pointer for string1
    let j = 0; // Pointer for string2
    let operatorCount = 0;
  
    // Iterate through string2
    while (j < string2.length) {
      // Check if we've matched all characters from string1
      if (i < string1.length) {
        // If characters match, advance both pointers
        if (string1[i] === string2[j]) {
          i++;
          j++;
        } else {
          // If characters don't match, it must be an operator in string2
          operatorCount++;
          j++; // Only advance the string2 pointer
        }
      } else {
        // We've already used all characters from string1,
        // so any remaining characters in string2 must be operators.
        operatorCount++;
        j++;
      }
    }
  
    // Final check: Did we successfully match all characters from string1?
    // If i didn't reach the end of string1, it means string2 was missing
    // some characters or had them out of order.
    if (i === string1.length) {
      return operatorCount;
    } else {
      // Indicate that string2 wasn't formed correctly from string1
      // (e.g., string1="123", string2="1+4")
      return -1;
    }
  }

export function solutionCanExist(allSolutions, solutionToCheck ){
return allSolutions.filter(a=>countOperatorsNeeded(solutionToCheck,a)>0);
}

console.log((solutionCanExist(_121212, "1+21212")));

