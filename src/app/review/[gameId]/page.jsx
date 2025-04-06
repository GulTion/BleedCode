"use client"
// app/leaderboard/page.js
import MainLayout from '@/app/components/layout/MainLayout';
import GameReplayAnalysis from '@/app/components/GameReplayAnalysis';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { findHundredSolutions } from '@/app/utils/solutionMaker';
import { stateMakerFromDiff } from '@/app/utils/stateDiff';
import { progressGraph } from '@/app/utils/progressGraph';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area
} from 'recharts';

const LeaderboardPage = () => {
  const params = useParams();
  const gameId = params?.gameId;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [gameStatesData, setGameStatesData] = useState([]);
  const [digits, setDigits] = useState("");

  useEffect(() => {
    if (!gameId) {
      setError("Game ID not found.");
      setIsLoading(false);
      return;
    }
    const username = localStorage.getItem("username");
    if (!username) {
        setError("Username not found. Please log in.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    fetch(`/api/games/${gameId}/review?username=${username}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch review data (status: ${res.status})`);
        return res.json();
      })
      .then(e => {
        if (!e.data || !e.data.digits || !e.data.state) {
            throw new Error("Invalid data format received from API.");
        }
        const currentDigits = Array.isArray(e.data.digits) ? e.data.digits : [];
        setDigits(currentDigits.join(""));
        const allSolutions = findHundredSolutions(currentDigits);
        const userStates = stateMakerFromDiff(currentDigits, e.data.state || []);
        const processedStates = progressGraph(allSolutions, userStates).map((stateInfo, index) => ({
            ...stateInfo,
            index: index + 1,
            userAttemptExpression: stateInfo.state,
            timestamp: Date.now() - index * 500,
            optimalSolutionsForThisState: stateInfo.solutions,
        }));
        setChartData(processedStates.map(s => ({ index: s.index, progress: s.progress })));
        setGameStatesData(processedStates);
        setError(null);
      })
      .catch(err => {
        console.error("Error fetching or processing game review:", err);
        setError(err.message || "An error occurred while loading game review.");
        setChartData([]);
        setGameStatesData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [gameId]);

  return (
    // Assuming MainLayout handles overall page structure and potentially scrolling
    <MainLayout>
      {/*
        NOTE: Ensure MainLayout's primary content area allows scrolling
        (e.g., using overflow-y-auto) if content exceeds viewport height.
      */}

      {/* Main content wrapper within the layout */}
      <div className="container mx-auto px-4 py-8"> {/* Overall padding */}

        {/* Wrapper to control width of BOTH Chart and Replay Analysis */}
        {/* Choose a max-width that suits your design, e.g., max-w-5xl, max-w-6xl, max-w-7xl */}
        <div className="max-w-6xl mx-auto space-y-10"> {/* Centered container + spacing */}

          {/* --- Loading and Error States --- */}
          {isLoading && <div className="text-center text-gray-400 py-10">Loading game analysis...</div>}
          {error && <div className="text-center text-red-400 py-10">Error: {error}</div>}

          {/* --- Chart Section (Renders inside the width-constrained wrapper) --- */}
          {!isLoading && !error && chartData.length > 0 && (
            <div className="p-4 md:p-6 bg-gray-800/50 backdrop-blur-md rounded-lg shadow-xl border border-purple-500/30">
              <h2 className="text-xl font-semibold text-purple-300 mb-4 text-center">Progress Over Time</h2>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}> {/* Added bottom margin for X-label */}
                    <defs>
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis
                      dataKey="index"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      label={{ value: "Attempt Step", position: 'insideBottom', dy: 15, fill: '#9CA3AF', fontSize: 12 }} // Adjusted dy
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Progress (%)', angle: -90, position: 'insideLeft', dx: -5, fill: '#9CA3AF', fontSize: 12 }}
                    />
                    <Tooltip
                       contentStyle={{ backgroundColor: 'rgba(40, 40, 60, 0.8)', border: '1px solid #58507a', borderRadius: '4px' }}
                       labelStyle={{ color: '#d1d5db' }}
                       itemStyle={{ color: '#a78bfa' }}
                       formatter={(value) => [`${value != null ? value.toFixed(1) : 'N/A'}%`, "Progress"]} // Format % and handle null
                       labelFormatter={(label) => `Step ${label}`}
                    />
                    <Area type="monotone" dataKey="progress" stroke="none" fillOpacity={1} fill="url(#progressGradient)" />
                    <Line type="monotone" dataKey="progress" stroke="#a78bfa" strokeWidth={2} activeDot={{ r: 6, fill: '#a78bfa', stroke: '#fff', strokeWidth: 1 }} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* --- Game Replay Section (Also renders inside the width-constrained wrapper) --- */}
          {!isLoading && !error && gameStatesData.length > 0 && (
               <GameReplayAnalysis
                  puzzleDigits={digits}
                  gameStates={gameStatesData}
               />
          )}
           {!isLoading && !error && gameStatesData.length === 0 && digits && (
               <div className="text-center text-gray-400 py-10">No game steps found for this review.</div>
           )}

        </div> {/* End of width-constrained wrapper */}
      </div> {/* End of container */}
    </MainLayout>
  );
};

export default LeaderboardPage;