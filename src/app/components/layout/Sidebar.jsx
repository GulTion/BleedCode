// components/layout/Sidebar.jsx
"use client"; // Needed for using usePathname

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { FaHome, FaUser, FaTrophy, FaChartBar, FaCog } from 'react-icons/fa'; // Add FaChartBar
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Home', icon: <FaHome />, path: '/home' },
  { name: 'My Profile', icon: <FaUser />, path: '/profile' },
  { name: 'Leaderboard', icon: <FaTrophy />, path: '/leaderboard' },
  { name: 'Statistics', icon: <FaChartBar />, path: '/statistics' }, // Add Statistics item
  // Add other items like Settings if needed
  // { name: 'Settings', icon: <FaCog />, path: '/settings' },
];

const Sidebar = () => {
  const pathname = usePathname(); // Get the current path

  return (
    <nav className="w-64 bg-gray-900/70 backdrop-blur-lg text-white p-5 flex flex-col border-r border-purple-500/20 shadow-xl">
      {/* Logo/Brand */}
      <div className="mb-10 text-center">
        <Link href="/home" className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          BleedCode
        </Link>
      </div>

      {/* Navigation Items */}
      <ul className="space-y-4 mt-4 flex-grow"> {/* Use flex-grow */}
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/home' && pathname.startsWith(item.path)); // Basic active check

          return (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center w-full space-x-3 p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'text-gray-300 hover:bg-gray-700/60 hover:text-white hover:translate-x-1'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Optional: Add settings or logout at the bottom */}
    </nav>
  );
};

export default Sidebar;