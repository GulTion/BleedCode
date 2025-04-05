// --- START OF FILE SpectatorMode.jsx ---

"use client"; // If using Next.js App Router

import React from 'react';
import { FaEye, FaUserCircle } from 'react-icons/fa';
import { RiRadioButtonLine } from 'react-icons/ri'; // For Live indicator

// --- Mock Data ---
const liveGamesData = [
  {
    id: 'game1',
    player1: { name: 'QuantumLeaper', rating: 2850, flag: '🇯🇵' },
    player2: { name: 'SyntaxSavvy', rating: 2835, flag: '🇺🇸' },
    status: 'Round 4/5',
    timeControl: '5 min',
    spectators: 125,
  },
  {
    id: 'game2',
    player1: { name: 'ByteBender', rating: 2695, flag: '🇮🇳' },
    player2: { name: 'LogicLaser', rating: 2755, flag: '🇬🇧' },
    status: 'In Progress',
    timeControl: '10 min',
    spectators: 88,
  },
  {
    id: 'game3',
    player1: { name: 'AlgoAstronaut', rating: 1980, flag: '🇧🇷' },
    player2: { name: 'CodeComet', rating: 1955, flag: '🇫🇷' },
    status: 'Starting...',
    timeControl: '3 min Blitz',
    spectators: 42,
  },
  {
    id: 'game4',
    player1: { name: 'RecursionReaper', rating: 2710, flag: '🇨🇦' },
    player2: { name: 'CipherSlinger', rating: 2790, flag: '🇩🇪' },
    status: 'Round 1/3',
    timeControl: '15 min Rapid',
    spectators: 102,
  },
   {
    id: 'game5',
    player1: { name: 'PixelPilot', rating: 2205, flag: '🇰🇷' },
    player2: { name: 'DataDynamo', rating: 2180, flag: '🇦🇺' },
    status: 'In Progress',
    timeControl: '5 min',
    spectators: 65,
  },
];

const SpectatorMode = () => {

  const handleSpectate = (gameId) => {
    console.log(`Attempting to spectate game: ${gameId}`);
    // Add logic here to navigate to the specific game spectating view
    alert(`Joining spectate for game ${gameId}... (Implement Navigation)`);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-xl border border-blue-500/30 text-white max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-blue-400 to-indigo-400">
         Live Games - Spectate
      </h2>

      {/* Filter/Search Placeholder */}
      <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search players or games..."
            className="px-4 py-2 rounded-lg bg-gray-800/70 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm w-full sm:w-auto"
          />
      </div>

      {/* List of Live Games */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {liveGamesData.map((game) => (
          <div
            key={game.id}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-700/70 transition-colors duration-150"
          >
            {/* Player Info Section */}
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 w-full">
              {/* Player 1 */}
              <div className="flex items-center text-sm space-x-1.5">
                <span className="text-lg">{game.player1.flag}</span>
                <span className="font-medium text-gray-100 truncate max-w-[100px] sm:max-w-[150px]">{game.player1.name}</span>
                <span className="text-xs text-gray-400">({game.player1.rating})</span>
              </div>

              {/* VS Separator */}
              <span className="font-bold text-purple-400 text-sm mx-1">VS</span>

              {/* Player 2 */}
              <div className="flex items-center text-sm space-x-1.5">
                 <span className="text-xs text-gray-400">({game.player2.rating})</span>
                 <span className="font-medium text-gray-100 truncate max-w-[100px] sm:max-w-[150px]">{game.player2.name}</span>
                 <span className="text-lg">{game.player2.flag}</span>
              </div>
            </div>

            {/* Game Status & Spectate Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 w-full md:w-auto justify-center md:justify-end">
                {/* Status */}
                <div className="text-center">
                    <div className="text-xs text-blue-300 font-medium mb-0.5 flex items-center justify-center gap-1">
                        <RiRadioButtonLine className="text-red-500 animate-pulse" /> LIVE
                    </div>
                    <div className="text-xs text-gray-400">{game.status}</div>
                    <div className="text-xs text-gray-500">{game.timeControl}</div>
                </div>

                 {/* Spectators Count */}
                 <div className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                     <FaEye className="mr-1.5 text-teal-400"/> {game.spectators} watching
                 </div>

                 {/* Spectate Button */}
                <button
                    onClick={() => handleSpectate(game.id)}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                    <FaEye /> Spectate
                </button>
            </div>
          </div>
        ))}

         {liveGamesData.length === 0 && (
             <div className="text-center py-10 text-gray-500">No live games currently available.</div>
         )}
      </div>

       {/* Custom Scrollbar Style (Optional) */}
       <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(32, 190, 179, 0.5); /* teal-400/50 approx */ border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(32, 190, 179, 0.7); /* teal-400/70 approx */ }
      `}</style>
    </div>
  );
};

export default SpectatorMode;

// --- END OF FILE SpectatorMode.jsx ---