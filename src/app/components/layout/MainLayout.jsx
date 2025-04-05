"use client"
// components/layout/MainLayout.jsx
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StarBackground from './StarBackground';
import { AnimatePresence } from 'framer-motion'; // Import AnimatePresence

// Mock user data (replace later)
// const userData = ;

const MainLayout = ({ children }) => {

  useEffect(()=>{
    const userName = localStorage.getItem("username");
    fetch(`/api/users/${userName}`).then(e=>e.json()).then(e=>{
      console.log(e);
      setUserData(e.data);
      
    })
  },[]);
  const [userData, setUserData] = useState({
    username: 'Loading..',
    coins: 0,
})
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <StarBackground />
      <Navbar username={userData.username} coins={userData.coins} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10">
          {/* Apply custom scrollbar style */}
          <style jsx global>{`
            main::-webkit-scrollbar { width: 8px; }
            main::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.5); border-radius: 10px; }
            main::-webkit-scrollbar-thumb { background-color: rgba(167, 139, 250, 0.6); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
            main::-webkit-scrollbar-thumb:hover { background-color: rgba(192, 132, 252, 0.8); }
          `}</style>

          {/* Wrap page children with AnimatePresence */}
          {/* 'wait' mode ensures exit animation finishes before enter animation starts */}
          {/* 'initial={false}' prevents animation on initial load */}
          <AnimatePresence mode="wait" initial={false}>
            {/* The actual page content (children) will need a motion wrapper inside it */}
            {children}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
};

export default MainLayout;