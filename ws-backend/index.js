// socket-server/server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS to allow connections from your Next.js app's origin
// Replace 'http://localhost:3000' with your actual frontend URL if different
const io = new Server(server, {
    cors: {
      // Pass an array of allowed origins
      origin: [
          "http://localhost:3000",        // Allow localhost
          "http://192.168.17.138:3000"  // Allow specific local network IP
      ],
      methods: ["GET", "POST"], // Specify allowed HTTP methods
      // credentials: true // Add this if you need to handle cookies or authorization headers
    }
  });

// Keep track of users in rooms (can be improved with a database for persistence)
// Structure: { roomId: { socketId: { playerId, role, targetPlayerId? } } }
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // --- Join Room Logic ---
  socket.on('joinRoom', ({ roomId, playerId, role = 'player', targetPlayerId = null }) => {
    if (!roomId) {
        console.error(`Socket ${socket.id} tried to join without roomId`);
        // Optionally emit an error back to the client
        socket.emit('errorJoining', { message: 'Room ID is required.' });
        return;
    }

    socket.join(roomId);
    console.log(`Socket ${socket.id} (${role} ${playerId || ''}) joined room ${roomId}`);

    // Store user info associated with this socket
    if (!rooms[roomId]) {
        rooms[roomId] = {};
    }
    rooms[roomId][socket.id] = {
        playerId: role === 'player' ? playerId : null, // Only players have their own ID here for game state
        role: role,
        targetPlayerId: role === 'spectator' ? targetPlayerId : null // Who the spectator is watching
    };

    // Notify the client they joined successfully (optional)
    socket.emit('joinedRoom', { roomId, role, targetPlayerId });

    // TODO: Implement logic to send current state if a spectator joins mid-game
    // This requires storing the latest state per player or requesting it.
    // For simplicity now, spectators only see updates *after* they join.
    console.log("Current rooms state:", JSON.stringify(rooms, null, 2)); // Log room state for debugging
  });

  // --- Player Update Logic ---
  socket.on('updateEquation', ({ roomId, playerId, equation }) => {
    if (!roomId || !playerId || !equation) {
        console.error(`Invalid updateEquation received from ${socket.id}`);
        return; // Ignore invalid events
    }
    console.log(`Equation update from player ${playerId} in room ${roomId}`);
    console.log(equation);
    // Broadcast to spectators in the *same room* watching *this player*
    if (rooms[roomId]) {
        Object.entries(rooms[roomId]).forEach(([socketId, userInfo]) => {
            // Check if it's a spectator watching the player who sent the update
            if (userInfo.role === 'spectator' && userInfo.targetPlayerId === playerId) {
                // Use io.to(socketId).emit to send only to this specific spectator
                io.to(socketId).emit('equationUpdated', {
                    playerID: playerId, // Let spectator confirm it's for the player they watch
                    equation: equation
                });
                console.log(` >> Sent equation update for ${playerId} to spectator ${socketId}`);
            }
        });
    }
  });

  socket.on('updateResult', ({ roomId, playerId, result }) => {
      if (!roomId || !playerId || result === undefined) {
        console.error(`Invalid updateResult received from ${socket.id}`);
        return; // Ignore invalid events
      }
    console.log(`Result update from player ${playerId} in room ${roomId}: ${result}`);

    // Broadcast to spectators in the *same room* watching *this player*
    if (rooms[roomId]) {
        Object.entries(rooms[roomId]).forEach(([socketId, userInfo]) => {
            // Check if it's a spectator watching the player who sent the update
            if (userInfo.role === 'spectator' && userInfo.targetPlayerId === playerId) {
                 // Use io.to(socketId).emit to send only to this specific spectator
                io.to(socketId).emit('resultUpdated', {
                    playerID: playerId,
                    result: result
                });
                console.log(` >> Sent result update for ${playerId} to spectator ${socketId}`);
            }
        });
    }
  });

  // --- Disconnect Logic ---
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find which room the socket was in and remove them
    for (const roomId in rooms) {
      if (rooms[roomId][socket.id]) {
        console.log(`Removing ${socket.id} from room ${roomId}`);
        delete rooms[roomId][socket.id];
        // If room is empty, delete the room (optional)
        if (Object.keys(rooms[roomId]).length === 0) {
          console.log(`Room ${roomId} is now empty, removing.`);
          delete rooms[roomId];
        }
        // Optional: Notify others in the room that someone left
        // io.to(roomId).emit('userLeft', { socketId: socket.id });
        break; // Assume socket is only in one room for this simple model
      }
    }
    console.log("Current rooms state after disconnect:", JSON.stringify(rooms, null, 2));
  });
});

const PORT = process.env.PORT || 4000; // Use a different port than your Next.js app
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});