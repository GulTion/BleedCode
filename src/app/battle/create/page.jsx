"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // Import useRouter

const CreateBattlePage = () => {
  const router = useRouter(); // Initialize router
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [waiting, setWaiting] = useState(false);

  const handleCreateRoom = () => {
    const generatedId = nanoid(6); // Generate 6-character alphanumeric ID
    setRoomId(generatedId);
    // setWaiting(true);
    router.push(`/battle?roomID=${generatedId}&playerID=${localStorage.getItem("username")}`);

    // handleJoinRoom();
  };

  const handleJoinRoom = () => {
    if (joinRoomId.length === 6) {
      
      router.push(`/battle?roomID=${joinRoomId}&playerID=${localStorage.getItem("username")}`);
    } else {
      alert("Please enter a valid 6-character Room ID.");
    }
  };
  const username = "GuestUser"; // Replace with actual username logic if available
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
        Custom Battle Room
      </h1>

      {/* Create Room Section */}
      <div className="bg-gray-800/70 p-6 rounded-lg shadow-lg border border-purple-500/30 w-full max-w-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create a Room</h2>
        {roomId ? (
          <div className="text-center">
            <p className="text-lg mb-4">Room ID: <span className="font-bold text-purple-400">{roomId}</span></p>
            {waiting && <p className="text-sm text-gray-400">Waiting for someone to join...</p>}
          </div>
        ) : (
          <button
            onClick={handleCreateRoom}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            Create Room
          </button>
        )}
      </div>

      {/* Join Room Section */}
      <div className="bg-gray-800/70 p-6 rounded-lg shadow-lg border border-purple-500/30 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Join a Room</h2>
        <input
          type="text"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value)}
          maxLength={6}
          placeholder="Enter Room ID"
          className="w-full px-4 py-2 bg-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
        />
        <button
          onClick={handleJoinRoom}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Enter Room
        </button>
      </div>
    </div>
  );
};

export default CreateBattlePage;
