// socket-server/server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const GAME_DURATION_SECONDS = 60; // Base duration

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// --- Updated Room Structure ---
// { roomId: { users: { socketId: { uniqueId, playerId?, role, targetPlayerId?, solvedTime: number | null } },
//             gameStarted: boolean, gameStartTime: number | null, gameDuration: number } }
const rooms = {};

// --- Helper Function: Get Users in Room ---
// Now includes solvedTime for players
function getUsersInRoom(roomId) {
    const roomData = rooms[roomId];
    if (!roomData || !roomData.users) return [];

    const userList = [];
    Object.values(roomData.users).forEach(userInfo => {
        const user = {
            uniqueId: userInfo.uniqueId,
            role: userInfo.role,
        };
        if (userInfo.role === 'player') {
            user.playerId = userInfo.playerId;
            user.solvedTime = userInfo.solvedTime; // Include solve time
        }
        if (userInfo.role === 'spectator') {
            user.targetPlayerId = userInfo.targetPlayerId;
        }
        userList.push(user);
    });
    // No sorting here, frontend will handle display sorting
    // console.log(`[Helper] getUsersInRoom(${roomId}):`, userList);
    return userList;
}
// --- End Helper Function ---

io.on('connection', (socket) => {
    console.log(`[Connection] User connected: ${socket.id}`);
    let currentRoomId = null;

    // --- Join Room Logic ---
    socket.on('joinRoom', ({ roomId, playerId, role = 'player', targetPlayerId = null }) => {
        if (!roomId) { socket.emit('errorJoining', { message: 'Room ID required.' }); return; }

        // --- Leave Previous Room ---
        if (currentRoomId && currentRoomId !== roomId) { /* ... leave/cleanup logic ... */ }

        // --- Join New Room ---
        socket.join(roomId);
        currentRoomId = roomId;
        console.log(`[Room Join] Socket ${socket.id} (${role} ${playerId || ''}) joined room ${roomId}`);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: {},
                gameStarted: false,
                gameStartTime: null,
                gameDuration: GAME_DURATION_SECONDS
            };
        }

        // Store user info, including initializing solvedTime for players
        const uniqueId = role === 'player' ? `player-${playerId}` : `spectator-${socket.id}`;
        rooms[roomId].users[socket.id] = {
            uniqueId,
            playerId: role === 'player' ? playerId : null,
            role,
            targetPlayerId: role === 'spectator' ? targetPlayerId : null,
            solvedTime: role === 'player' ? null : undefined // Initialize solvedTime only for players
        };

        socket.emit('joinedRoom', { roomId, role, targetPlayerId });

        // Broadcast updated user list
        const currentUserList = getUsersInRoom(roomId);
        io.to(roomId).emit('roomUserListUpdate', currentUserList);

        // Sync for Late Joiners (send game state if started)
        if (rooms[roomId].gameStarted && rooms[roomId].gameStartTime) {
            socket.emit('gameHasStarted', {
                roomId: roomId,
                gameStartTime: rooms[roomId].gameStartTime,
                gameDuration: rooms[roomId].gameDuration
            });
            // TODO: Send spectator initial equation state if needed
        }
    });

    // --- Start Game Logic ---
    socket.on('startGame', (roomId) => {
        // ... (validation logic remains the same) ...
        const room = rooms[roomId];
        const user = room?.users?.[socket.id];
        if (!room || !user || user.role !== 'player' || room.gameStarted || Object.keys(room.users).length < 2) { /*... handle errors ...*/ return; }

        room.gameStarted = true;
        room.gameStartTime = Date.now();
        // Reset solved times for all players in the room when a new game starts
        Object.keys(room.users).forEach(sid => {
             if(room.users[sid].role === 'player') {
                 room.users[sid].solvedTime = null;
             }
        });

        console.log(`[Game Started] Room ${roomId} at ${room.gameStartTime}. Solved times reset.`);

        // Broadcast start info (includes duration)
        io.to(roomId).emit('gameHasStarted', {
            roomId: roomId,
            gameStartTime: room.gameStartTime,
            gameDuration: room.gameDuration
        });

         // Broadcast the initial user list again to reflect reset solved times
         const initialUserList = getUsersInRoom(roomId);
         io.to(roomId).emit('roomUserListUpdate', initialUserList);
    });

    // --- *** NEW: Player Solved Event Handler *** ---
    socket.on('playerSolved', ({ roomId, playerId }) => {
        const room = rooms[roomId];
        const userSocketId = Object.keys(room?.users || {}).find(sid => room.users[sid].playerId === playerId);
        const userInfo = userSocketId ? room.users[userSocketId] : null;

        // Validations
        if (!room || !room.gameStarted || !room.gameStartTime) {
            console.warn(`[Solve Rejected] Game not active or not found for room ${roomId}`);
            return;
        }
        if (!userInfo || userInfo.role !== 'player') {
            console.warn(`[Solve Rejected] Player ${playerId} not found or not a player in room ${roomId}`);
            return;
        }
        if (userInfo.solvedTime !== null) {
            console.warn(`[Solve Rejected] Player ${playerId} already has a solve time recorded.`);
            return; // Already solved
        }

        // Record elapsed time in milliseconds
        const solveTimeMs = Date.now() - room.gameStartTime;
        userInfo.solvedTime = solveTimeMs;
        console.log(`[Player Solved] Player ${playerId} in room ${roomId} solved in ${solveTimeMs} ms.`);

        // *** Broadcast the updated user list with the new solve time ***
        const updatedUserList = getUsersInRoom(roomId);
        io.to(roomId).emit('roomUserListUpdate', updatedUserList);
    });


    // --- Player Updates (Equation/Result) ---
    socket.on('updateEquation', ({ roomId, playerId, equation }) => { /* ... no change ... */ });
    socket.on('updateResult', ({ roomId, playerId, result }) => { /* ... no change ... */ });

    // --- Disconnect Logic ---
    socket.on('disconnect', (reason) => {
        console.log(`[Disconnect] User disconnected: ${socket.id}. Reason: ${reason}`);
        const roomId = currentRoomId;

        if (roomId && rooms[roomId]?.users?.[socket.id]) {
            delete rooms[roomId].users[socket.id]; // Remove user

            if (Object.keys(rooms[roomId].users).length === 0) {
                delete rooms[roomId]; // Delete room if empty
                console.log(`[Room Cleanup] Room ${roomId} empty, removed.`);
            } else {
                // Broadcast updated user list to remaining users
                const updatedUserList = getUsersInRoom(roomId);
                io.to(roomId).emit('roomUserListUpdate', updatedUserList);
                // TODO: Handle game ending if player leaves?
            }
        }
        currentRoomId = null;
    });

    socket.on('error', (err) => { console.error(`[Socket Error] Socket ${socket.id} error:`, err); });
});

server.listen(process.env.PORT || 4000, () => { console.log(`\n🚀 Socket.IO server running on port ${process.env.PORT || 4000}`); });