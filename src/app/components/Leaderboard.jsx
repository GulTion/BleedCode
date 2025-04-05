// --- START OF FILE Leaderboard.jsx ---

"use client"; // If using Next.js App Router

import React from 'react';
// Using react-icons for potential title/status icons
import { FaCrown, FaUserGraduate, FaMedal, FaAngleUp, FaAngleDown, FaEquals } from 'react-icons/fa';

// --- Mock Data ---
const leaderboardData = [
  { rank: 1, name: 'QuantumLeaper', rating: 2850, title: 'GM', flag: '🇯🇵', trend: 'up', change: 15, stats: 'W: 152 | L: 20 | D: 8' },
  { rank: 2, name: 'SyntaxSavvy', rating: 2835, title: 'GM', flag: '🇺🇸', trend: 'down', change: 5, stats: 'W: 180 | L: 35 | D: 10' },
  { rank: 3, name: 'CipherSlinger', rating: 2790, title: 'IM', flag: '🇩🇪', trend: 'up', change: 25, stats: 'W: 120 | L: 15 | D: 5' },
  { rank: 4, name: 'fearless_mind', rating: 2788, title: 'NM', flag: '🇵🇰', trend: 'up', change: 12, stats: 'W: 210 | L: 50 | D: 15' },
  { rank: 5, name: 'LogicLaser', rating: 2755, title: 'IM', flag: '🇬🇧', trend: 'stable', change: 0, stats: 'W: 140 | L: 30 | D: 12' },
  { rank: 6, name: 'RecursionReaper', rating: 2710, title: 'NM', flag: '🇨🇦', trend: 'down', change: 8, stats: 'W: 115 | L: 28 | D: 9' },
  { rank: 7, name: 'ByteBender', rating: 2695, title: 'FM', flag: '🇮🇳', trend: 'up', change: 18, stats: 'W: 100 | L: 22 | D: 7' },
  // ... more ranks
  { rank: 48, name: 'SpaceExplorer', rating: 2150, title: '', flag: '🇦🇺', trend: 'up', change: 22, stats: 'W: 85 | L: 40 | D: 11', isCurrentUser: true }, // Example current user
  // ... more ranks
  { rank: 100, name: 'AlgoAstronaut', rating: 1980, title: '', flag: '🇧🇷', trend: 'stable', change: 2, stats: 'W: 50 | L: 30 | D: 8' },
];

// Helper to get title icon/style (example)
const TitleBadge = ({ title }) => {
  if (!title) return null;
  let color = 'text-gray-400';
  let Icon = FaUserGraduate; // Default
  if (title === 'GM') { color = 'text-red-500'; Icon = FaCrown; }
  if (title === 'IM') { color = 'text-orange-400'; Icon = FaMedal; }
  if (title === 'FM') { color = 'text-yellow-400'; }
  if (title === 'NM') { color = 'text-purple-400'; }

  return <span className={`font-bold text-xs ${color} mr-1.5`}><Icon className="inline mr-0.5 h-3 w-3" />{title}</span>;
};

// Helper for trend indicator
const TrendIndicator = ({ trend, change }) => {
    let Icon = FaEquals;
    let color = 'text-gray-400';
    if (trend === 'up') { Icon = FaAngleUp; color = 'text-green-400'; }
    if (trend === 'down') { Icon = FaAngleDown; color = 'text-red-400'; }

    return (
        <span className={`flex items-center text-xs ${color}`}>
            <Icon className="mr-0.5" />
            {change !== 0 ? Math.abs(change) : ''}
        </span>
    );
};

const Leaderboard = () => {
  const currentUserRank = leaderboardData.find(p => p.isCurrentUser)?.rank;

  return (
    <div className="p-4 md:p-6 bg-gray-900/80 backdrop-blur-lg rounded-lg shadow-xl border border-purple-500/30 text-white ">
      <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
        Global Leaderboard
      </h2>

      {/* Header Row */}
      <div className="hidden md:flex items-center text-xs font-semibold text-gray-400 uppercase px-4 py-2 bg-white/5 rounded-t-md mb-1 space-x-4">
        <div className="w-10 text-center">Rank</div>
        <div className="flex-1">Player</div>
        <div className="w-20 text-center">Rating</div>
        <div className="w-24 text-center">Trend</div>
        <div className="w-32 text-center">Stats (W/L/D)</div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {leaderboardData.map((player) => (
          <div
            key={player.rank}
            className={`flex flex-col md:flex-row items-center px-4 py-2 rounded-md transition-colors duration-150 space-y-1 md:space-y-0 md:space-x-4 ${
              player.isCurrentUser
                ? 'bg-purple-600/40 border border-purple-400 shadow-lg'
                : 'bg-gray-800/60 hover:bg-gray-700/70'
            }`}
          >
            {/* Rank */}
            <div className="w-full md:w-10 text-center font-bold text-lg md:text-base text-purple-300">
              {player.rank}
            </div>

            {/* Player Info */}
            <div className="flex-1 flex items-center space-x-2 w-full justify-center md:justify-start">
                <span className="text-lg md:text-base">{player.flag}</span>
                <TitleBadge title={player.title} />
                <span className={`font-medium truncate ${player.isCurrentUser ? 'text-white' : 'text-gray-100'}`}>
                    {player.name}
                </span>
            </div>

            {/* Rating */}
            <div className="w-full md:w-20 text-center font-semibold text-yellow-300">
              {player.rating}
            </div>

            {/* Trend */}
            <div className="w-full md:w-24 flex justify-center">
                <TrendIndicator trend={player.trend} change={player.change} />
            </div>

            {/* Stats */}
            <div className="w-full md:w-32 text-center text-xs text-gray-400">
              {player.stats}
            </div>
          </div>
        ))}
      </div>

      {/* Footer/Pagination Placeholder */}
      <div className="mt-4 text-center text-xs text-gray-500">
        {currentUserRank ? `Your Rank: ${currentUserRank}` : "You are not ranked yet."}
        {/* Add Pagination buttons if needed */}
      </div>

      {/* Custom Scrollbar Style (Optional) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(167, 139, 250, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(167, 139, 250, 0.7); }
      `}</style>
    </div>
  );
};

export default Leaderboard;

// --- END OF FILE Leaderboard.jsx ---