"use client";
import { useState, useEffect } from 'react';
import {
    FaPlus, FaMinus, FaQuestion, FaThumbsUp, FaBan, FaGem, FaFire, FaFlagUsa, FaSearch, FaRegClock, FaEquals // Added FaEquals for draw
} from 'react-icons/fa';
import { IoMdPlanet } from 'react-icons/io';
import { RiSpaceShipFill } from 'react-icons/ri';

// --- UPDATED Mock Data ---
const gameHistoryData = [
  {
    gameId: 1,
    userUsername: 'fearless...',
    userRating: 2002,
    opponentUsername: 'dob-201...',
    opponentRating: 2027,
    result: 'win',
    durationSeconds: 59, // Updated
    playedAt: '2025-04-04T10:00:00Z' // Updated
  },
  {
    gameId: 2,
    userUsername: 'fearless...',
    userRating: 1993,
    opponentUsername: 'Plywood...',
    opponentRating: 2054,
    result: 'win',
    durationSeconds: 55, // Updated
    playedAt: '2025-04-04T14:15:00Z' // Updated
  },
   {
    gameId: 3,
    userUsername: 'Hai-sensei-i...',
    userRating: 1932,
    opponentUsername: 'fearless...',
    opponentRating: 1983,
    result: 'loss',
    durationSeconds: 49, // Updated
    playedAt: '2025-04-05T09:30:00Z' // Updated
  },
  {
    gameId: 4,
    userUsername: 'fearless...',
    userRating: 1993,
    opponentUsername: 'Hai-sensei-i...',
    opponentRating: 1922,
    result: 'win',
    durationSeconds: 60, // Updated
    playedAt: '2025-04-05T11:05:00Z' // Updated
  },
    {
    gameId: 5,
    userUsername: 'Hai-sensei-i...',
    userRating: 1929,
    opponentUsername: 'fearless...',
    opponentRating: 1986,
    result: 'loss',
    durationSeconds: 48, // Updated
    playedAt: '2025-04-05T16:40:00Z' // Updated
  },
   {
    gameId: 6,
    userUsername: 'dustinluis',
    userRating: 1983,
    opponentUsername: 'fearless...',
    opponentRating: 1979,
    result: 'loss',
    durationSeconds: 60, // Updated
    playedAt: '2025-04-06T08:00:00Z' // Updated
  },
  {
    gameId: 7,
    userUsername: 'fearless...',
    userRating: 1980,
    opponentUsername: 'drawMaster',
    opponentRating: 1980,
    result: 'draw',
    durationSeconds: 60, // Updated
    playedAt: '2025-04-06T18:22:00Z' // Updated
  }
];

// --- Helper Player Info Component (No Changes Needed) ---
const PlayerInfo = ({ playerName, playerRating, isCurrentUser }) => {
    const nameColor = isCurrentUser ? "text-green-400 font-semibold" : "text-gray-200";
    const playerColorSquare = isCurrentUser ? "bg-green-500" : "bg-gray-500";
    const showTitle = isCurrentUser;

    return (
        <div className="flex items-center space-x-1.5 text-sm mb-0.5">
            <span className={`inline-block w-2 h-2 rounded-sm ${playerColorSquare} flex-shrink-0`}></span>
            {showTitle && <span className="font-semibold text-orange-400 text-xs flex-shrink-0">NM</span>}
            <span className={`${nameColor} truncate flex-grow min-w-0`} title={playerName}>
                {playerName}
                <span className="text-gray-400 text-xs flex-shrink-0 ml-1">({playerRating})</span>
            </span>
        </div>
    );
};


// --- Main Game History Component (No Changes Needed in Logic) ---
const GameHistory = () => {
  const [stars, setStars] = useState([]);
  const [data, setData] = useState(gameHistoryData);
  const [currentUsername, setCurrentUsername] = useState('fearless...');

   useEffect(() => {
     const storedUsername = localStorage.getItem("username") || 'fearless...';
     setCurrentUsername(storedUsername);
   }, []);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 0.2 + 0.1,
        opacity: Math.random() * 0.8 + 0.2
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  const formatDuration = (seconds) => {
      if (seconds === null || seconds === undefined) return 'N/A';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
          // Keep using toLocaleDateString for flexible display format
          return new Date(dateString).toLocaleDateString(undefined, {
              year: 'numeric', month: 'numeric', day: 'numeric'
          });
      } catch (e) {
          return 'Invalid Date';
      }
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Stars background */}
      <div className="fixed inset-0 z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}rem`,
              height: `${star.size}rem`,
              opacity: star.opacity,
              animation: `twinkle ${Math.random() * 5 + 3}s infinite ease-in-out`
            }}
          />
        ))}
      </div>

      {/* Cosmic gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-blue-900/30 z-0"></div>

      {/* Main content container */}
      <div className="relative z-10 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* History Container */}
                <div className="bg-gray-800/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-purple-500/20">
                    {/* History Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
                        <h2 className="text-xl font-semibold text-white tracking-wide">Game History</h2>
                    </div>

                    {/* Data Display */}
                    {data.length === 0 && <div className="p-6 text-center text-gray-400">No games found.</div>}

                    {data.length > 0 && (
                        <div className="divide-y divide-gray-700/40">
                            {/* Table Header Row */}
                            <div className="hidden md:flex items-center text-xs font-semibold text-gray-400 uppercase px-4 py-3 bg-white/5 space-x-4">
                                <div className="flex-1 min-w-[250px]">Players</div>
                                <div className="w-20 text-center flex-shrink-0">Result</div>
                                <div className="w-20 text-center flex-shrink-0">Time</div>
                                <div className="w-20 text-center flex-shrink-0">Review</div>
                                <div className="w-24 text-right flex-shrink-0">Date</div>
                            </div>

                            {/* Game Rows */}
                            {data.map((game) => {
                                let player1Name, player1Rating, player2Name, player2Rating;
                                let player1IsCurrentUser, player2IsCurrentUser;
                                let score1, score2;
                                const gameResult = game.result?.toLowerCase();

                                if (game.userUsername === currentUsername) {
                                    player1Name = game.userUsername;
                                    player1Rating = game.userRating;
                                    player2Name = game.opponentUsername;
                                    player2Rating = game.opponentRating;
                                    player1IsCurrentUser = true;
                                    player2IsCurrentUser = false;
                                    score1 = (gameResult === 'win') ? 1 : ((gameResult === 'loss') ? 0 : 0.5);
                                    score2 = (gameResult === 'win') ? 0 : ((gameResult === 'loss') ? 1 : 0.5);
                                } else if (game.opponentUsername === currentUsername) {
                                    player1Name = game.opponentUsername;
                                    player1Rating = game.opponentRating;
                                    player2Name = game.userUsername;
                                    player2Rating = game.userRating;
                                    player1IsCurrentUser = true;
                                    player2IsCurrentUser = false;
                                    score1 = (gameResult === 'loss') ? 1 : ((gameResult === 'win') ? 0 : 0.5);
                                    score2 = (gameResult === 'loss') ? 0 : ((gameResult === 'win') ? 1 : 0.5);
                                } else {
                                    player1Name = game.userUsername || 'Player 1';
                                    player1Rating = game.userRating;
                                    player2Name = game.opponentUsername || 'Player 2';
                                    player2Rating = game.opponentRating;
                                    player1IsCurrentUser = false;
                                    player2IsCurrentUser = false;
                                    score1 = (gameResult === 'win') ? 1 : ((gameResult === 'loss') ? 0 : 0.5);
                                    score2 = (gameResult === 'win') ? 0 : ((gameResult === 'loss') ? 1 : 0.5);
                                }

                                const outcomeColor = score1 > score2 ? 'text-green-400' : (score1 < score2 ? 'text-red-400' : 'text-gray-400');
                                const OutcomeIcon = score1 > score2 ? FaPlus : (score1 < score2 ? FaMinus : FaEquals);

                                return (
                                    <div key={game.gameId || game.id} className="flex flex-col md:flex-row items-stretch md:items-center px-4 py-3 hover:bg-purple-900/20 transition-colors duration-150 space-y-3 md:space-y-0 md:space-x-4">
                                        {/* Players Column */}
                                        <div className="flex-1 min-w-0 md:min-w-[250px]">
                                            <span className="md:hidden text-xs text-gray-400 uppercase font-semibold mr-2">Players:</span>
                                            <div className="mt-1 md:mt-0">
                                                <PlayerInfo playerName={player1Name} playerRating={player1Rating} isCurrentUser={player1IsCurrentUser} />
                                                <PlayerInfo playerName={player2Name} playerRating={player2Rating} isCurrentUser={player2IsCurrentUser} />
                                            </div>
                                        </div>
                                        {/* Result Column */}
                                        <div className="w-full md:w-20 text-left md:text-center flex-shrink-0 flex items-center justify-start md:justify-center space-x-2">
                                            <span className="md:hidden text-xs text-gray-400 uppercase font-semibold w-16 flex-shrink-0">Result:</span>
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className={`flex flex-col items-center text-sm font-medium ${outcomeColor}`}>
                                                    <span>{score1 % 1 === 0 ? score1 : score1.toFixed(1)}</span>
                                                    <span className="text-gray-300">{score2 % 1 === 0 ? score2 : score2.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Time Column */}
                                        <div className="w-full md:w-20 text-left md:text-center flex-shrink-0 flex items-center">
                                            <span className="md:hidden text-xs text-gray-400 uppercase font-semibold w-16 flex-shrink-0">Time:</span>
                                            <span className="text-sm text-white flex items-center justify-center w-full">
                                                <FaRegClock className="mr-1.5 text-blue-300 opacity-80"/> {formatDuration(game.durationSeconds)}
                                            </span>
                                        </div>
                                        {/* Review Column */}
                                        <div className="w-full md:w-20 text-left md:text-center flex-shrink-0 flex items-center justify-start md:justify-center">
                                            <span className="md:hidden text-xs text-gray-400 uppercase font-semibold w-16 flex-shrink-0">Review:</span>
                                            <button className="p-1.5 rounded-full text-gray-300 hover:text-white hover:bg-purple-600/50 transition-colors">
                                                <FaSearch className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {/* Date Column */}
                                        <div className="w-full md:w-24 text-left md:text-right flex-shrink-0 flex items-center">
                                            <span className="md:hidden text-xs text-gray-400 uppercase font-semibold w-16 flex-shrink-0">Date:</span>
                                            <span className="text-sm text-gray-400 w-full text-left md:text-right">{formatDate(game.playedAt)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                     )}
                </div>
            </div>
        </div>
      {/* CSS */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        main::-webkit-scrollbar { width: 8px; }
        main::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        main::-webkit-scrollbar-thumb { background-color: rgba(192, 132, 252, 0.6); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        main::-webkit-scrollbar-thumb:hover { background-color: rgba(167, 139, 250, 0.8); }
      `}</style>
    </div>
  );
};

export default GameHistory;