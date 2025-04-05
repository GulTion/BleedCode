"use client"
// components/layout/Navbar.jsx
import React from 'react';
import Link from 'next/link'; // Use Next.js Link for navigation
import { FaCoins, FaUser } from 'react-icons/fa';
import { IoMdPlanet } from 'react-icons/io';
import { RiSpaceShipFill } from 'react-icons/ri';

const Navbar = ({ username = 'Guest', coins = 0 }) => {
  return (
    <header className="bg-gray-800/80 backdrop-blur-sm border-b border-purple-500/30 p-4 flex items-center justify-between shrink-0 relative z-20">
      {/* Left placeholder (can be used for logo or back button) */}
      <div className="w-64">
          {/* Example: Link back to home */}
          <Link href="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
             {/* Optionally hide on smaller screens if sidebar is persistent */}
          </Link>
      </div>

      {/* Game title */}
      <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <IoMdPlanet className="text-purple-400 text-3xl animate-pulse" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 hidden sm:block">
            HectoClash
          </h1>
           <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 sm:hidden">
            HC
          </h1>
          <RiSpaceShipFill className="text-blue-400 text-3xl animate-bounce" />
      </Link>

      {/* User profile section */}
      <div className="flex items-center space-x-2 sm:space-x-4 w-64 justify-end">
        <div className="flex items-center bg-gray-700/60 rounded-full px-2 sm:px-4 py-1 sm:py-2">
          <FaCoins className="text-yellow-400 mr-1 sm:mr-2 text-sm sm:text-base" />
          <span className="font-semibold text-xs sm:text-sm">{coins}</span>
        </div>
        <Link href="/profile" className="flex items-center cursor-pointer group">
          <span className="mr-2 text-xs sm:text-sm hidden md:inline">{username}</span>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FaUser className="text-white text-sm sm:text-base" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;