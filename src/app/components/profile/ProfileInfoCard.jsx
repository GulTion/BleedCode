// components/profile/ProfileInfoCard.jsx
import React from 'react';
import { FaUser, FaCalendarAlt, FaTrophy, FaStar } from 'react-icons/fa';

// Replace with actual user data fetching
const mockProfileData = {
    username: 'CosmicRacer',
    joinDate: '2024-01-15',
    rating: 1985,
    title: 'NM', // Example title
    rank: 123,
    avatarUrl: null // Add URL if available, otherwise show default
};

const ProfileInfoCard = () => {
  return (
    <div className="bg-gray-800/70 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Avatar */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center border-2 border-purple-400 shadow-md shrink-0">
          {mockProfileData.avatarUrl ? (
            <img src={mockProfileData.avatarUrl} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <FaUser className="text-white text-5xl" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 text-center sm:text-left">
           <div className="flex items-center justify-center sm:justify-start mb-2">
               {mockProfileData.title && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-sm mr-2">{mockProfileData.title}</span>
               )}
               <h2 className="text-2xl sm:text-3xl font-bold text-white">{mockProfileData.username}</h2>
           </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300 mt-3">
            <div className="flex items-center">
              <FaStar className="mr-2 text-yellow-400" />
              <span>Rating: <span className="font-semibold text-white">{mockProfileData.rating}</span></span>
            </div>
             <div className="flex items-center">
              <FaTrophy className="mr-2 text-purple-400" />
              <span>Rank: <span className="font-semibold text-white">#{mockProfileData.rank}</span></span>
            </div>
            <div className="flex items-center col-span-2 sm:col-span-1">
              <FaCalendarAlt className="mr-2 text-blue-400" />
              <span>Joined: <span className="font-semibold text-white">{new Date(mockProfileData.joinDate).toLocaleDateString()}</span></span>
            </div>
             {/* Add more stats like Wins/Losses, Accuracy etc. here */}
             <div className="flex items-center">
                 {/* Placeholder for Wins */}
             </div>
          </div>
          {/* Optional: Edit Profile Button */}
          {/* <button className="mt-4 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-medium transition-colors">Edit Profile</button> */}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;