"use client"
// app/leaderboard/page.js
import MainLayout from '@/app/components/layout/MainLayout';
import GameReplayAnalysis from '@/app/components/GameReplayAnalysis';
import { _state } from '../../utils/_state';
import { progressGraph } from '../../utils/progressGraph';
import { _121212 } from '../../utils/_121212';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { findHundredSolutions } from '@/app/utils/solutionMaker';
import { stateMakerFromDiff } from '@/app/utils/stateDiff';


// const gameStates = progressGraph(_121212, _state).map((e,i)=>({userAttemptExpression:e.state, timestamp:Date.now() - i*500, optimalSolutionsForThisState:e.solutions, progress:e.progress}))

const LeaderboardPage = () => {
  let {gameId} = useParams()
  useEffect(()=>{
    fetch(`/api/games/${gameId}/review?username=${localStorage.getItem("username")}`).then(e=>e.json()).then(e=>{

      let allSolution = findHundredSolutions(e.data.digits);
      let states = stateMakerFromDiff(e.data.digits, e.data.state);
      let gameStates =  progressGraph(allSolution, states).map((e,i)=>({userAttemptExpression:e.state, timestamp:Date.now() - i*500, optimalSolutionsForThisState:e.solutions, progress:e.progress}));
      setData(gameStates);
      setDigits(e.data.digits.join());
    });

  },[]);
  const [data, setData] = useState({});
  const [digits, setDigits] = useState("111111");

  return (
    <MainLayout>
      <div className="text-center mt-10">
        {/* <h1 className="text-3xl font-bold text-purple-400">Leaderboard</h1> */}
        <GameReplayAnalysis
  puzzleDigits={digits}
  gameStates={data}
        />
      </div>
    </MainLayout>
  );
};

export default LeaderboardPage;