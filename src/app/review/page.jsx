// app/leaderboard/page.js
import MainLayout from '@/app/components/layout/MainLayout';
import GameReplayAnalysis from '@/app/components/GameReplayAnalysis';
import { _state } from '../utils/_state';
import { progressGraph } from '../utils/progressGraph';
import { _121212 } from '../utils/_121212';


const gameStates = progressGraph(_121212, _state).map((e,i)=>({userAttemptExpression:e.state, timestamp:Date.now() - i*500, optimalSolutionsForThisState:e.solutions, progress:e.progress}))

const LeaderboardPage = () => {
  return (
    <MainLayout>
      <div className="text-center mt-10">
        {/* <h1 className="text-3xl font-bold text-purple-400">Leaderboard</h1> */}
        <GameReplayAnalysis
  puzzleDigits="121212"
  gameStates={gameStates}
        />
      </div>
    </MainLayout>
  );
};

export default LeaderboardPage;