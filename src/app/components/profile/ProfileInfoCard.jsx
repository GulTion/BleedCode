// components/profile/ProfileInfoCard.jsx
import React, {useEffect, useState} from 'react';
import { FaUser, FaCalendarAlt, FaTrophy, FaStar, FaUserFriends } from 'react-icons/fa';

// Replace with actual user data fetching
// const userData = {
//     username: 'CosmicRacer',
//     joinDate: '2024-01-15',
//     rating: 1985,
//     title: 'NM', // Example title
//     rank: 123,
//     avatarUrl: null // Add URL if available, otherwise show default
// };

const ProfileInfoCard = () => {
  const [userData, setUserData] = useState({
    username: 'Loading...',
    joinDate: '',
    rating: null,
    title: '',
    rank: null,
    image: null // Changed from avatarUrl to image to match session/db
  });

  useEffect(() => {
    // Consider using useSession() hook here for better integration
    const userName = localStorage.getItem("username");
    if (userName) {
      fetch(`/api/users/${userName}`)
        .then((e) => e.json())
        .then((e) => {
          if (e.success && e.data) {
            console.log(e.data);

            // Assuming API returns data with an 'image' field
            setUserData({
              username: e.data.username || 'N/A',
              joinDate: e.data.createdAt ? new Date(e.data.createdAt).toLocaleDateString() : 'N/A',
              rating: e.data.rating, // Adjust field names as per your API response
              title: e.data.title,
              rank: e.data.rank,
              numberOfFriends:e.data.numberOfFriends,
              image: e.data.image // Use the 'image' field from API response
            });

            
          } else {
             console.error("Failed to fetch user data:", e.message);
             // Handle error state appropriately
          }
        })
        .catch(error => {
            console.error("Error fetching user data:", error);
            // Handle fetch error state
        });
    }
  }, []);

  return (
    <div className="bg-gray-800/70 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 mb-8 shadow-lg">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Avatar */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center border-2 border-purple-400 shadow-md shrink-0 overflow-hidden">
          {userData.image ? ( // Check userData.image
            <img src={userData.image} alt="User Avatar" className="w-full h-full object-cover" /> // Use userData.image
          ) : (
            <FaUser className="text-white text-5xl" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 text-center sm:text-left">
           <div className="flex items-center justify-center sm:justify-start mb-2">
               {userData.title && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-sm mr-2">{userData.title}</span>
               )}
               <h2 className="text-2xl sm:text-3xl font-bold text-white">{userData.username}</h2>
           </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300 mt-3">
            <div className="flex items-center">
              <FaStar className="mr-2 text-yellow-400" />
              <span>Rating: <span className="font-semibold text-white">{userData.rating}</span></span>
            </div>
             <div className="flex items-center">
              <FaUserFriends className="mr-2 text-purple-400" />
              <span>Friends: <span className="font-semibold text-white">{userData.numberOfFriends}</span></span>
            </div>
            <div className="flex items-center col-span-2 sm:col-span-1">
              <FaCalendarAlt className="mr-2 text-blue-400" />
              <span>Joined: <span className="font-semibold text-white">{new Date(userData.joinDate).toLocaleDateString()}</span></span>
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