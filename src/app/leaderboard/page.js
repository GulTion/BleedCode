// app/leaderboard/page.js
import MainLayout from '@/app/components/layout/MainLayout';
import Leaderboard from '../components/Leaderboard';

const LeaderboardPage = () => {
  return (
    <MainLayout>
      {/* <div className="text-center mt-10"> */}
        {/* <h1 className="text-3xl font-bold text-purple-400">Leaderboard</h1> */}
        <Leaderboard />
      {/* </div> */}
    </MainLayout>
  );
};

export default LeaderboardPage;