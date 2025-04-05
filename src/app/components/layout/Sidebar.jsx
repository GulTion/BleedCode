// components/layout/Sidebar.jsx
"use client"; // Needed for using usePathname

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { FaHome, FaUser, FaTrophy, FaChartBar } from 'react-icons/fa';

const navItems = [
  { name: 'Home', icon: <FaHome />, path: '/home' },
  { name: 'My Profile', icon: <FaUser />, path: '/profile' },
  { name: 'Leaderboard', icon: <FaTrophy />, path: '/leaderboard' },
  { name: 'Statistics', icon: <FaChartBar />, path: '/statistics' },
];

const Sidebar = () => {
  const pathname = usePathname(); // Get the current path

  return (
    <nav className="w-64 bg-gray-800/60 backdrop-blur-sm border-r border-purple-500/30 p-6 shrink-0 relative z-10 hidden md:block"> {/* Hide on small screens */}
      <ul className="space-y-4 mt-4">
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