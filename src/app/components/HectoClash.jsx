// --- START OF FILE HectoClashHomePage.jsx ---

"use client"; // Keep this directive for Next.js App Router client components
import { useState, useEffect } from 'react';
import { FaHome, FaUser, FaTrophy, FaChartBar, FaClock, FaUsers, FaCog, FaCoins } from 'react-icons/fa';
import { IoMdPlanet } from 'react-icons/io';
import { RiSpaceShipFill } from 'react-icons/ri';

const HectoClashHomePage = () => {
  const [username, setUsername] = useState('SpaceExplorer');
  const [coins, setCoins] = useState(1250);
  const [activeNav, setActiveNav] = useState('Home');

  // Star background animation
  // Removed TypeScript type annotation: Array<{id: number, x: number, y: number, size: number, opacity: number}>
  const [stars, setStars] = useState([]); // Initialize as an empty array

  useEffect(() => {
    // Generate random stars for the background
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 0.2 + 0.1,
          opacity: Math.random() * 0.8 + 0.2
        });
      }
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
      <div className="relative z-10 flex flex-col h-screen">
        {/* Top navigation bar */}
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-purple-500/30 p-4 flex items-center justify-between">
          {/* Empty space for balance */}
          <div className="w-64"></div>

          {/* Game title */}
          <div className="flex items-center space-x-2">
            <IoMdPlanet className="text-purple-400 text-3xl animate-pulse" />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              HectoClash
            </h1>
            <RiSpaceShipFill className="text-blue-400 text-3xl animate-bounce" />
          </div>

          {/* User profile section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-700/60 rounded-full px-4 py-2">
              <FaCoins className="text-yellow-400 mr-2" />
              <span className="font-semibold">{coins}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">{username}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main content area with sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar navigation */}
          <nav className="w-64 bg-gray-800/60 backdrop-blur-sm border-r border-purple-500/30 p-6 shrink-0"> {/* Added shrink-0 */}
            <ul className="space-y-6">
              {[
                { name: 'Home', icon: <FaHome /> },
                { name: 'My Profile', icon: <FaUser /> },
                { name: 'Leaderboard', icon: <FaTrophy /> },
                { name: 'Statistics', icon: <FaChartBar /> }
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => setActiveNav(item.name)}
                    className={`flex items-center w-full space-x-3 p-3 rounded-lg transition-all ${
                      activeNav === item.name
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' // Added shadow for active state
                        : 'text-gray-300 hover:bg-gray-700/60 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main content */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto"> {/* Ensure vertical scroll */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center text-purple-300 tracking-wide">
                Choose Your Cosmic Challenge
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'Time Trial', // Renamed for clarity
                    icon: <FaClock className="text-4xl text-yellow-400" />,
                    description: 'Race the clock! Solve as many puzzles as possible before time runs out.'
                  },
                  {
                    title: 'Blitz Duel (1 Min)', // Renamed
                    icon: <FaUsers className="text-4xl text-green-400" />,
                    description: 'Face off in lightning-fast 1-minute duels against random opponents.'
                  },
                  {
                    title: 'Ranked Duel', // Renamed
                    icon: <RiSpaceShipFill className="text-4xl text-blue-400" />,
                    description: 'Climb the ranks! Challenge players globally in real-time rated matches.'
                  },
                  {
                    title: 'Custom Lobby', // Renamed
                    icon: <FaCog className="text-4xl text-purple-400" />,
                    description: 'Forge your own challenge. Set custom rules and invite friends.'
                  }
                ].map((mode) => (
                  <div
                    key={mode.title}
                    className="bg-gray-800/70 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 flex flex-col items-center text-center space-y-4 hover:bg-gray-700/80 transition-all hover:shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-1 cursor-pointer group"
                  >
                     {/* Icon Container */}
                     <div className="w-20 h-20 mb-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-purple-400/30 flex items-center justify-center shadow-inner transform group-hover:rotate-12 transition-transform duration-300 ease-out">
                       {mode.icon}
                     </div>
                     {/* Content */}
                    <h3 className="text-xl font-semibold text-white">{mode.title}</h3>
                    <p className="text-gray-300 text-sm flex-grow">{mode.description}</p> {/* flex-grow helps align buttons */}
                    <button className="mt-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full text-white font-medium transition-all shadow-md hover:shadow-lg">
                      Launch Challenge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* CSS for star animation */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--opacity-start, 0.2); transform: scale(0.9); }
          50% { opacity: var(--opacity-end, 0.8); transform: scale(1.1); }
        }
        /* Apply random start/end opacity via inline style if needed for more variation */
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

        /* Custom Scrollbar (optional, for Webkit browsers) */
        main::-webkit-scrollbar {
          width: 8px;
        }
        main::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        main::-webkit-scrollbar-thumb {
          background-color: rgba(192, 132, 252, 0.6); /* purple-400 with opacity */
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        main::-webkit-scrollbar-thumb:hover {
          background-color: rgba(167, 139, 250, 0.8); /* purple-500 with opacity */
        }

      `}</style>
    </div>
  );
};

export default HectoClashHomePage;

// --- END OF FILE HectoClashHomePage.jsx ---