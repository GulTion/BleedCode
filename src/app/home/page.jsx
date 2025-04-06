// app/page.js
"use client"; // Add this!

import MainLayout from '@/app/components/layout/MainLayout';
import { FaClock, FaUsers, FaCog } from 'react-icons/fa';
import { RiSpaceShipFill } from 'react-icons/ri';
import { motion } from 'framer-motion'; // Import motion
import { usePathname } from 'next/navigation'; // Import usePathname
import { useRouter } from "next/navigation"; // Import useRouter


// Define animation variantsa (can be reused across pages)
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20, // Start slightly below
  },
  in: {
    opacity: 1,
    y: 0, // Animate to original position
  },
  out: {
    opacity: 0,
    y: -20, // Exit slightly above
  },
};

// Define transition properties (can be reused)
const pageTransition = {
  type: 'tween', // Smooth interpolation
  ease: 'anticipate', // Easing function (e.g., 'easeInOut', 'circOut')
  duration: 0.4, // Animation duration
};


const HomePage = () => {
    const pathname = usePathname(); // Get current path for the key
    const router = useRouter();
    const handleCreateCustomRoom= ()=>{
      router.push("/battle/create");
    }
    

    const handleCreateRoom= ()=>{
      router.push("/battle/ranked");
    }
    // Data for game mode cards
    const gameModes = [
        //  { title: 'Time Trial', icon: <FaClock className="text-4xl text-yellow-400" />, description: 'Race the clock! Solve as many puzzles as possible before time runs out.' },
        //  { title: 'Blitz Duel (1 Min)', icon: <FaUsers className="text-4xl text-green-400" />, description: 'Face off in lightning-fast 1-minute duels against random opponents.' },
         { title: 'Ranked Duel', icon: <RiSpaceShipFill className="text-4xl text-blue-400" />, description: 'Climb the ranks! Challenge players globally in real-time rated matches.', onclick:handleCreateRoom},
         { title: 'Custom Lobby', icon: <FaCog className="text-4xl text-purple-400" />, description: 'Forge your own challenge. Set custom rules and invite friends.',onclick:handleCreateCustomRoom  }
    ];


  return (
    <MainLayout>
        {/* Wrap the specific page content in motion.div */}
        <motion.div
            key={pathname} // Crucial: Unique key based on path tells AnimatePresence when content changes
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
            <h2 className="text-2xl font-bold mb-6 md:mb-8 text-center text-purple-300 tracking-wide">
                    Choose Your Cosmic Challenge
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {gameModes.map((mode) => (
                    <div
                      onClick={mode.onclick}
                        key={mode.title}
                        className="bg-gray-800/70 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 flex flex-col items-center text-center space-y-4 hover:bg-gray-700/80 transition-all hover:shadow-lg hover:shadow-purple-500/20 transform hover:-translate-y-1 cursor-pointer group"
                    >
                        <div className="w-20 h-20 mb-3 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-purple-400/30 flex items-center justify-center shadow-inner transform group-hover:rotate-12 transition-transform duration-300 ease-out">
                        {mode.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-white">{mode.title}</h3>
                        <p className="text-gray-300 text-sm flex-grow min-h-[60px]">{mode.description}</p>
                        <button  className="mt-auto px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full text-white font-medium transition-all shadow-md hover:shadow-lg">
                        Launch Challenge
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    </MainLayout>
  );
};

export default HomePage;