'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaCheckCircle, FaTimesCircle, FaMinusCircle, FaSpinner, FaGamepad, FaTrophy, FaHandshake, FaPercentage } from 'react-icons/fa'; // Added more icons
import MainLayout from '@/app/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import ActivityGraph from '@/app/components/statistics/ActivityGraph'; // Import the new component

// Reusable component for displaying a single statistic
const StatCard = ({ title, value, icon }) => (
  <div className="bg-gray-800/60 p-6 rounded-lg shadow-md flex items-center space-x-4 transition-transform hover:scale-105">
    {icon && <div className="text-3xl text-purple-400">{icon}</div>}
    <div>
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  </div>
);

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 }, // Slide up slightly
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }, // Slide down slightly
};

const pageTransition = {
  type: 'tween', // Smoother tween
  ease: 'anticipate', // Nice easing
  duration: 0.5
};


// Helper function to generate dummy activity data (paste the function here or import it)
const generateDummyActivityData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365); // Go back one year

    let currentDate = new Date(startDate);

    while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
        let count = 0;
        const random = Math.random();

        if (random < 0.7) { // 70% chance of 0 contributions
        count = 0;
        } else if (random < 0.85) { // 15% chance of 1-2 contributions
        count = Math.floor(Math.random() * 2) + 1;
        } else if (random < 0.95) { // 10% chance of 3-5 contributions
        count = Math.floor(Math.random() * 3) + 3;
        } else { // 5% chance of 6-10 contributions
        count = Math.floor(Math.random() * 5) + 6;
        }

         // Simulate lower activity on weekends (optional)
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
        if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() < 0.6) { // Reduce weekend activity
            count = Math.floor(count / 2);
        }


        data.push({ date: dateStr, count });
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
    return data;
};


const StatisticsPage = () => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: '0%',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState([]); // State for activity data

  useEffect(() => {
    // Generate dummy activity data on mount (replace with fetched data later)
    setActivityData(generateDummyActivityData());

    const fetchStats = async () => {
      if (status === 'authenticated' && session?.user?.username) {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch game history (keep your existing logic)
          const res = await fetch(`/api/game/history?username=${session.user.username}`);
          if (!res.ok) {
            throw new Error('Failed to fetch game history');
          }
          const historyData = await res.json();

          const totalGames = historyData.games?.length || 0;
          let wins = 0;
          let losses = 0;
          let draws = 0;

          // TODO: Later, calculate actual daily activity from historyData
          // const dailyCounts = {}; // { 'YYYY-MM-DD': count }
          // historyData.games?.forEach(game => {
          //    const dateKey = new Date(game.createdAt).toISOString().split('T')[0];
          //    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
          // });
          // const realActivityData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
          // setActivityData(realActivityData); // Update state with real data

          historyData.games?.forEach(game => {
            // Determine result based on the logged-in user
            const playerColor = game.whitePlayerUsername === session.user.username ? 'white' : 'black';
            const opponentColor = playerColor === 'white' ? 'black' : 'white';

            if (game.status === 'COMPLETED') {
              if (game.winner === playerColor) wins++;
              else if (game.winner === opponentColor) losses++;
              else if (game.winner === 'draw') draws++; // Assuming 'draw' indicates a draw
            } else if (game.status === 'DRAW') { // Handle explicit draw status
                draws++;
            }
            // Add handling for other statuses like ABORTED if needed
          });


          const playedGames = wins + losses + draws; // Calculate based on definite outcomes
          const winRate = playedGames > 0 ? ((wins / playedGames) * 100).toFixed(1) + '%' : '0%';

          setStats({
            totalGames: historyData.games?.length || 0, // Still show total attempts/games
            wins,
            losses,
            draws,
            winRate,
          });

        } catch (err) {
          console.error("Error fetching statistics:", err);
          setError(err.message || 'Could not load statistics.');
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setError('Please log in to view your statistics.');
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [session, status]);

  if (status === 'loading') { // Simplified loading check
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
          <FaSpinner className="animate-spin text-4xl text-purple-400" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return <MainLayout><div className="text-center text-red-400 mt-10">{error}</div></MainLayout>;
  }

  if (status === 'unauthenticated') {
     return <MainLayout><div className="text-center text-yellow-400 mt-10">Please log in to view statistics.</div></MainLayout>;
  }

  return (
    <MainLayout>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="container mx-auto px-4 py-8 text-white"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Your Statistics
        </h1>

        {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <FaSpinner className="animate-spin text-3xl text-purple-400" />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Games" value={stats.totalGames} icon={<FaGamepad />} />
                <StatCard title="Wins" value={stats.wins} icon={<FaTrophy className="text-yellow-400"/>} />
                <StatCard title="Losses" value={stats.losses} icon={<FaTimesCircle className="text-red-400"/>} />
                {/* <StatCard title="Draws" value={stats.draws} icon={<FaHandshake />} /> */} {/* Optional */}
                <StatCard title="Win Rate" value={stats.winRate} icon={<FaPercentage />} />
            </div>
        )}


        <h2 className="text-2xl font-semibold mb-4 mt-12">Daily Activity</h2>
        {/* Render the Activity Graph */}
        <ActivityGraph data={activityData} />

      </motion.div>
    </MainLayout>
  );
};

export default StatisticsPage;