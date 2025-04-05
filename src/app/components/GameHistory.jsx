"use client";
import { useState, useEffect } from 'react';
import {
    FaPlus, FaMinus, FaQuestion, FaThumbsUp, FaBan, FaGem, FaFire, FaFlagUsa, FaSearch, FaRegClock,
    FaHome, FaUser, FaTrophy, FaChartBar, FaClock, FaUsers, FaCog, FaCoins
} from 'react-icons/fa';
import { IoMdPlanet } from 'react-icons/io';
import { RiSpaceShipFill } from 'react-icons/ri';

// --- Mock Data (Adjusted for new columns) ---
const gameHistoryData = [
  {
    id: 1,
    player1: { name: 'fearless...', rating: 2002, title: 'NM', country: 'PK', statusIcon: FaQuestion, flagIcon: '🇵🇰', color: 'bg-green-500' },
    player2: { name: 'dob-201...', rating: 2027, title: '', country: 'US', statusIcon: FaFlagUsa, flagIcon: '🇺🇸', color: 'bg-gray-500' },
    result: { p1Score: 1, p2Score: 0, outcomeIcon: FaPlus, outcomeColor: 'text-green-400' },
    timeTaken: '1:15', // Example time
    date: '4/20/2024'
  },
  {
    id: 2,
    player1: { name: 'fearless...', rating: 1993, title: 'NM', country: 'PK', statusIcon: FaQuestion, flagIcon: '🇵🇰', color: 'bg-green-500' },
    player2: { name: 'Plywood...', rating: 2054, title: '', country: 'GB', statusIcon: FaThumbsUp, flagIcon: '🇬🇧', color: 'bg-gray-500' },
    result: { p1Score: 1, p2Score: 0, outcomeIcon: FaPlus, outcomeColor: 'text-green-400' },
    timeTaken: '0:58',
    date: '4/20/2024'
  },
  {
    id: 3,
    player1: { name: 'Hai-sensei-i...', rating: 1932, title: '', country: '??', statusIcon: FaBan, flagIcon: '🚫', color: 'bg-gray-500' },
    player2: { name: 'fearless...', rating: 1983, title: 'NM', country: 'PK', statusIcon: FaQuestion, flagIcon: '🇵🇰', color: 'bg-green-500' },
    result: { p1Score: 1, p2Score: 0, outcomeIcon: FaMinus, outcomeColor: 'text-red-400' }, // Icon indicates rating loss for P2?
    timeTaken: '2:03',
    date: '4/20/2024'
  },
  {
    id: 4,
    player1: { name: 'fearless...', rating: 1993, title: 'NM', country: 'PK', statusIcon: FaQuestion, flagIcon: '🇵🇰', color: 'bg-green-500' },
    player2: { name: 'Hai-sensei-i...', rating: 1922, title: '', country: '??', statusIcon: FaBan, flagIcon: '🚫', color: 'bg-gray-500' },
    result: { p1Score: 1, p2Score: 0, outcomeIcon: FaPlus, outcomeColor: 'text-green-400' },
    timeTaken: '1:45',
    date: '4/20/2024'
  },
    {
    id: 5,
    player1: { name: 'Hai-sensei-i...', rating: 1929, title: '', country: '??', statusIcon: FaBan, flagIcon: '🚫', color: 'bg-gray-500' },
    player2: { name: 'fearless...', rating: 1986, title: 'NM', country: 'PK', statusIcon: FaQuestion, flagIcon: '🇵🇰', color: 'bg-green-500' },
    result: { p1Score: 0, p2Score: 1, outcomeIcon: FaPlus, outcomeColor: 'text-green-400' }, // P2 wins
    timeTaken: '1:33',
    date: '4/20/2024'
  },
   {
    id: 6,
    player1: { name: 'dustinluis', rating: 1983, title: '', country: 'US', statusIcon: null, flagIcon: '🇺🇸', color: 'bg-gray-500' },
    player2: { name: 'fearless...', rating: 1979, title: 'NM', country: 'PK', statusIcon: FaQuestion, flagIcon: '🇵🇰', color: 'bg-green-500' },
    result: { p1Score: 0, p2Score: 1, outcomeIcon: FaPlus, outcomeColor: 'text-green-400' }, // P2 wins
    timeTaken: '0:48',
    date: '4/20/2024'
  },
];

// --- Helper Player Info Component (Adapted for Theme) ---
const PlayerInfo = ({ player, rating }) => {
    // const StatusIcon = player.statusIcon;

    

    return (
        <div className="flex items-center space-x-1.5 text-sm mb-0.5">
            <span className={`inline-block w-2 h-2 rounded-sm ${player.color} flex-shrink-0`}></span>
            {player==localStorage.getItem("username") && <span className="font-semibold text-orange-400 text-xs flex-shrink-0">NM</span>}
            <span className="text-gray-200 truncate flex-grow min-w-0" title={player}>{player} <span className="text-gray-400 text-xs flex-shrink-0">({rating})</span></span>
            
         
            {/* {StatusIcon && <StatusIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />} */}
        </div>
    );
};


// --- Main Game History Component ---
const GameHistory = () => {
  // State for stars (same as HomePage)
  const [stars, setStars] = useState([]);
  // Mock user data for header (replace with actual context/props)
  const [username, setUsername] = useState('SpaceExplorer');
  const [coins, setCoins] = useState(1250);

  useEffect(()=>{

    fetch(`/api/games?username=${localStorage.getItem("username")}`).then(e=>e.json()).then(e=>setData(e.data));
  },[])
  const [data, setData] = useState([])

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
    

        {/* Main Content Area */}
      
            <div className="max-w-7xl mx-auto"> {/* Wider container for table */}
                {/* History Container with Glassy Effect */}
                <div className="bg-gray-800/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-purple-500/20">
                    {/* History Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
                        <h2 className="text-xl font-semibold text-white tracking-wide">Game History</h2>
                        {/* Optional: Filters/Pagination */}
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* History List / Table */}
                    <div className="divide-y divide-gray-700/40">
                        {/* Table Header Row */}
                        <div className="hidden md:flex items-center text-xs font-semibold text-gray-400 uppercase px-4 py-3 bg-white/5 space-x-4">
                            <div className="flex-1 min-w-[250px]">Players</div> {/* Ensure enough min-width */}
                            <div className="w-20 text-center flex-shrink-0">Result</div>
                            <div className="w-20 text-center flex-shrink-0">Time</div>
                            <div className="w-20 text-center flex-shrink-0">Review</div>
                            <div className="w-24 text-right flex-shrink-0">Date</div>
                        </div>

                        {/* Game Rows */}
                        {data.map((game) => {
                 
                            return (
                                <div key={game.gameId} className="flex flex-col md:flex-row items-stretch md:items-center px-4 py-3 hover:bg-purple-900/20 transition-colors duration-150 space-y-3 md:space-y-0 md:space-x-4">

                                    {/* Players Column */}
                                    <div className="flex-1 min-w-0 md:min-w-[250px]"> {/* min-w-0 needed for truncation */}
                                         {/* Mobile Header (Optional) */}
                                         <span className="md:hidden text-xs text-gray-400 uppercase font-semibold mr-2">Players:</span>
                                         <div className="mt-1 md:mt-0">
                                             <PlayerInfo player={localStorage.getItem("username")}  rating={game.userRating}/>
                                             <PlayerInfo player={game.opponentUsername} rating={game.opponentRating}/>
                                         </div>
                                    </div>

                                    {/* Result Column */}
                                    <div className="w-full md:w-20 text-left md:text-center flex-shrink-0 flex items-center justify-start md:justify-center space-x-2">
                                        <span className="md:hidden text-xs text-gray-400 uppercase font-semibold w-16 flex-shrink-0">Result:</span>
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="flex flex-col items-center text-sm">
                                                <span className="text-white font-medium">{game.result=="win"?1:0}</span>
                                                <span className="text-gray-300">{game.result=="win"?0:1}</span>
                                            </div>
                                            {/* <OutcomeIcon className={`w-4 h-4 ${game.result.outcomeColor}`} /> */}
                                        </div>
                                    </div>

                                    {/* Time Column */}
                                    <div className="w-full md:w-20 text-left md:text-center flex-shrink-0 flex items-center">
                                        <span className="md:hidden text-xs text-gray-400 uppercase font-semibold w-16 flex-shrink-0">Time:</span>
                                        <span className="text-sm text-white flex items-center justify-center w-full">
                                             <FaRegClock className="mr-1.5 text-blue-300 opacity-80"/> {game.durationSeconds}
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
                                          <span className="text-sm text-gray-400 w-full text-left md:text-right">{(new Date(game.playedAt)).toDateString()}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     {/* Optional Footer for Pagination */}
                      {/* <div className="p-4 border-t border-gray-700/50 text-center">...</div> */}
                </div>
            </div>

     

      {/* CSS for star animation & scrollbar (same as HomePage) */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-bounce {
            animation: bounce 1.5s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-pulse {
             animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
           0%, 100% { opacity: 1; }
           50% { opacity: .7; }
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

// --- END OF FILE components/GameHistory.jsx ---