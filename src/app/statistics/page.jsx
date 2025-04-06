// app/profile/page.js
"use client"; // Add this!

import MainLayout from '@/app/components/layout/MainLayout';
import ProfileInfoCard from '@/app/components/profile/ProfileInfoCard';
import GameHistory from '@/app/components/GameHistory';
import { motion } from 'framer-motion'; // Import motion
import { usePathname } from 'next/navigation'; // Import usePathname

// Reuse or define variants and transitions
const pageVariants = {
  initial: { opacity: 0, x: -50 }, // Slide in from left example
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 50 }, // Slide out to right example
};

const pageTransition = {
  type: 'spring', // Different transition type
  stiffness: 100,
  damping: 20,
};


const ProfilePage = () => {
  const pathname = usePathname(); // Get path for key

  return (
    <MainLayout>
        <motion.div
             key={pathname} // Use path as key
             initial="initial"
             animate="in"
             exit="out"
             variants={pageVariants}
             transition={pageTransition}
        >
            <div className="max-w-7xl mx-auto">
       
                <div className="mt-8">
                
                    <div className="bg-gray-800/70 backdrop-blur-md rounded-lg shadow-xl overflow-hidden border border-purple-500/20">
                        {/* Assuming GameHistory just renders the table/list content */}
                        <GameHistory />
                    </div>
                </div>
            </div>
        </motion.div>
    </MainLayout>
  );
};

export default ProfilePage;