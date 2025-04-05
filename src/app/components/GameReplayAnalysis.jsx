// --- START OF FILE HectoClashStateReplay.jsx ---

"use client"; // If using Next.js App Router

import React, { useState, useEffect, useMemo } from 'react';
import {
  FaPlay, FaPause, FaStepBackward, FaStepForward, FaFastBackward, FaFastForward,
  FaCheckCircle, FaTimesCircle, FaLightbulb, FaCalculator, FaRegClock
} from 'react-icons/fa';
import { IoMdInformationCircleOutline } from "react-icons/io";

// --- Helper Function (Placeholder - REPLACE WITH SAFE IMPLEMENTATION) ---
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

// --- Main Component ---
const HectoClashStateReplay = ({
  puzzleDigits,         // string: e.g., "123456"
  // REMOVED top-level optimalSolutions prop
  gameStates = [],      // Array: [{ userAttemptExpression, timestamp, progress, optimalSolutionsForThisState }]
}) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [userResult, setUserResult] = useState(null);
  const [evaluationError, setEvaluationError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Memoize current state data
  const currentGameState = useMemo(() => {
    return gameStates && gameStates.length > currentStateIndex ? gameStates[currentStateIndex] : null;
  }, [gameStates, currentStateIndex]);

  // Derive specific data points from the current game state using useMemo
  const currentUserAttempt = useMemo(() => currentGameState?.userAttemptExpression, [currentGameState]);
  const currentProgress = useMemo(() => Math.max(0, Math.min(100, currentGameState?.progress ?? 0)), [currentGameState]);
  const currentTimestamp = useMemo(() => {
      if (!currentGameState?.timestamp) return 'N/A';
      try {
          return new Date(currentGameState.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch { return 'Invalid Date'; }
  }, [currentGameState]);
  // *** NEW: Get optimal solutions specific to the current state ***
  const currentOptimalSolutions = useMemo(() => currentGameState?.optimalSolutionsForThisState ?? [], [currentGameState]);

  // Effect to evaluate the expression when the state changes
  useEffect(() => {
    if (currentUserAttempt) {
      const { value, error } = evaluateExpression(currentUserAttempt);
      setUserResult(value);
      setEvaluationError(error);
      setIsCorrect(!error && value === 100);
    } else {
      setUserResult(null);
      setEvaluationError(null);
      setIsCorrect(false);
    }
  }, [currentUserAttempt]);

  // --- Navigation Handlers ---
  const handleGoToStart = () => setCurrentStateIndex(0);
  const handlePreviousState = () => setCurrentStateIndex(prev => Math.max(0, prev - 1));
  const handleNextState = () => setCurrentStateIndex(prev => Math.min(gameStates.length - 1, prev + 1));
  const handleGoToEnd = () => setCurrentStateIndex(gameStates.length - 1);

  // --- UI Helpers ---
  const getAttemptStyle = () => {
    if (evaluationError) return 'border-yellow-500 bg-yellow-900/30 text-yellow-300';
    if (currentUserAttempt === null) return 'border-gray-600 bg-gray-800/30 text-gray-400';
    if (isCorrect) return 'border-green-500 bg-green-900/30 text-green-300';
    return 'border-red-500 bg-red-900/30 text-red-300';
  };

   const getAttemptIcon = () => {
    if (evaluationError) return <FaCalculator className="text-yellow-500" />;
    if (currentUserAttempt === null) return <IoMdInformationCircleOutline className="text-gray-400" />;
    if (isCorrect) return <FaCheckCircle className="text-green-500" />;
    return <FaTimesCircle className="text-red-500" />;
  };

  // Render safeguard
  if (!gameStates || gameStates.length === 0) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg text-gray-400 text-center">
        No game states available for replay.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-800/80 backdrop-blur-md rounded-lg shadow-xl border border-purple-500/40 text-white max-w-4xl mx-auto">
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3 px-2">
            <div className="text-center sm:text-left">
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Puzzle</p>
                <p className="text-2xl font-mono font-bold tracking-widest text-blue-300">
                    {puzzleDigits.split('').join(' ')}
                </p>
            </div>
            <div className="text-center text-sm text-gray-400">
                Step {currentStateIndex + 1} of {gameStates.length}
                {/* <div className="flex items-center justify-center gap-1 mt-1">
                    <FaRegClock className="w-3 h-3"/>
                    <span>{currentTimestamp}</span>
                </div> */}
            </div>
        </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">

        {/* Left Side: User Attempt & Progress */}
        <div className="flex flex-col space-y-4">
           <div className={`p-4 rounded-lg border ${getAttemptStyle()} min-h-[150px] flex flex-col`}>
              <h4 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <span>Player Attempt</span>
                {getAttemptIcon()}
              </h4>
              <div className="font-mono text-lg break-words p-3 bg-black/40 rounded mb-3 min-h-[3rem] flex items-center justify-center flex-grow">
                {currentUserAttempt || <span className="text-gray-500 italic">No attempt yet</span>}
              </div>
              <div className="text-sm mt-auto">
                <p className="font-medium">Result: <span className={`font-bold ${isCorrect ? 'text-green-400' : evaluationError ? 'text-yellow-400' : 'text-red-400'}`}>
                    {evaluationError ? 'Error' : (userResult ?? 'N/A')}
                </span></p>
                {evaluationError && <p className="mt-1 text-yellow-300 text-xs">Error: {evaluationError}</p>}
              </div>
           </div>

            {/* Progress Bar */}
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <label htmlFor="game-progress" className="block text-sm font-medium text-gray-300 mb-1.5 text-center">Game Progress at this Step</label>
                <div className="flex items-center gap-3">
                 <progress /* Style as before */
                   id="game-progress"
                   className="w-full h-2.5 rounded-full appearance-none [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-blue-500 [&::-webkit-progress-value]:to-purple-500 [&::-webkit-progress-value]:rounded-full [&::-moz-progress-bar]:bg-gradient-to-r [&::-moz-progress-bar]:from-blue-500 [&::-moz-progress-bar]:to-purple-500 [&::-moz-progress-bar]:rounded-full"
                   value={currentProgress}
                   max="100"
                 ></progress>
                 <span className="text-sm font-semibold text-purple-300 w-10 text-right">{currentProgress.toFixed(0)}%</span>
                </div>
            </div>
        </div>


        {/* Right Side: Optimal Solutions FOR THIS STATE */}
        <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-900/40">
          <h4 className="text-lg font-semibold mb-3 flex items-center text-blue-300">
            <FaLightbulb className="mr-2 text-yellow-400"/> {currentOptimalSolutions.length} Possible Solutions 
          </h4>
          {/* *** MODIFIED: Use currentOptimalSolutions *** */}
          {currentOptimalSolutions && currentOptimalSolutions.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {currentOptimalSolutions.map((solution, index) => (
                <div key={index} className="font-mono text-sm break-words p-2 bg-black/40 rounded">
                  {solution}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 italic text-center py-4">
              No optimal solutions specified for this step.
            </div>
          )}
        </div>

      </div>

      {/* Control Panel (Unchanged) */}
       <div className="flex justify-center items-center space-x-2 sm:space-x-3 bg-gray-900/60 p-3 rounded-lg border border-gray-700/50">
         <button onClick={handleGoToStart} disabled={currentStateIndex === 0} className="p-2 rounded-full text-gray-300 hover:bg-purple-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Go to start">
            <FaFastBackward className="w-4 h-4 sm:w-5 sm:h-5"/>
         </button>
         <button onClick={handlePreviousState} disabled={currentStateIndex === 0} className="p-2 rounded-full text-gray-300 hover:bg-purple-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Previous step">
            <FaStepBackward className="w-4 h-4 sm:w-5 sm:h-5"/>
         </button>
         <button onClick={handleNextState} disabled={currentStateIndex >= gameStates.length - 1} className="p-2 rounded-full text-gray-300 hover:bg-purple-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Next step">
            <FaStepForward className="w-4 h-4 sm:w-5 sm:h-5"/>
         </button>
         <button onClick={handleGoToEnd} disabled={currentStateIndex >= gameStates.length - 1} className="p-2 rounded-full text-gray-300 hover:bg-purple-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Go to end">
            <FaFastForward className="w-4 h-4 sm:w-5 sm:h-5"/>
         </button>
      </div>

       {/* Custom Scrollbar Style (Unchanged) */}
       <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(167, 139, 250, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(167, 139, 250, 0.7); }
      `}</style>
    </div>
  );
};

export default HectoClashStateReplay;

