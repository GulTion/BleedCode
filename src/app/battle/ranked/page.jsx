// src/components/RankedMatchmaking.js - Sends only PlayerID

"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import "./base.css"; // Ensure this CSS file exists

const SOCKET_SERVER_URL = "http://localhost:4000"; // Ensure protocol if needed by client lib
const MIN_LOBBY_PLAYERS_FOR_MATCH = 4; // Update to match backend logic trigger point

// Replace with your actual method of getting the logged-in user's ID (username)
function getCurrentUserId() {
    // Example: Prompt for testing. Replace with authentication context/localStorage etc.
    return prompt("Enter your username (for testing):", `user_${Math.random().toString(16).slice(2,8)}`);
}

export default function RankedMatchmaking() {
    const router = useRouter();
    const socketRef = useRef(null);
    const [isMatchmaking, setIsMatchmaking] = useState(false);
    const [lobbyPlayerCount, setLobbyPlayerCount] = useState(0);
    const [statusMessage, setStatusMessage] = useState("Ready to find a match?");
    const [errorMessage, setErrorMessage] = useState(null);
    const [playerId, setPlayerId] = useState(null);

    // Get Player ID on mount
    useEffect(() => {
       const id = getCurrentUserId(); // Make sure this resolves correctly
       if (id) {
           setPlayerId(id);
       } else {
            setErrorMessage("Could not identify player. Please log in.");
            // Disable launch button if no player ID? (Handled below)
       }
    }, []);


    // --- Socket Connection Effect ---
    useEffect(() => {
        if (!playerId) return; // Don't connect without a player ID

        // Cleanup previous socket if component re-mounts or playerId changes
        if (socketRef.current) { socketRef.current.disconnect(); }

        let serverUrl = SOCKET_SERVER_URL;
        if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
             serverUrl = 'http://' + serverUrl;
        }

        socketRef.current = io(serverUrl, { autoConnect: false }); // Connect manually later
        const socket = socketRef.current;

        // --- Standard Listeners ---
        socket.on('connect', () => console.log(`Socket connected for matchmaking: ${socket.id}`));
        socket.on('disconnect', () => {
            console.log('Socket disconnected from matchmaking.');
            if (isMatchmaking) { setIsMatchmaking(false); setErrorMessage("Connection lost."); setStatusMessage("Disconnected."); }
        });
        socket.on('connect_error', (err) => { console.error('Matchmaking connection error:', err); setErrorMessage("Connection error."); setIsMatchmaking(false); });

        // --- Matchmaking Listeners ---
        socket.on('lobbyUpdate', ({ count }) => { setLobbyPlayerCount(count); if (isMatchmaking) setStatusMessage(`Waiting... (${count}/${MIN_LOBBY_PLAYERS_FOR_MATCH})`); });
        socket.on('matchmakingStatus', ({ message }) => { if (isMatchmaking) setStatusMessage(message); });
        socket.on('matchFound', ({ roomId: newRoomId, opponent }) => {
            console.log(`Match found! Room: ${newRoomId}, Opponent: ${opponent.playerId}`);
            setStatusMessage(`Match found vs ${opponent.playerId} (Rating: ${opponent.rating})! Joining...`);
            setErrorMessage(null);
            setTimeout(() => { router.push(`/battle?roomID=${newRoomId}&playerID=${playerId}`); }, 1500);
        });
        socket.on('matchmakingError', ({ message }) => { console.error('Matchmaking Error:', message); setErrorMessage(message); setIsMatchmaking(false); setStatusMessage("Error. Try again?"); });
        socket.on('leftLobby', () => { console.log("Left lobby."); setIsMatchmaking(false); setStatusMessage("Ready to find a match?"); setErrorMessage(null); setLobbyPlayerCount(0); });

        // Explicitly connect now that listeners are set up
        socket.connect();

        // Cleanup on component unmount
        return () => {
            if (socketRef.current?.connected) {
                if (isMatchmaking) { socketRef.current.emit('leaveMatchmaking'); }
                socketRef.current.disconnect();
            }
            socketRef.current = null;
        };
    // Only re-run if playerId changes (e.g., user logs out/in)
    }, [playerId, router, isMatchmaking]); // Added isMatchmaking here to manage leaving lobby on unmount if active


    // --- Action Handlers ---
    const handleLaunchChallenge = () => {
        if (!playerId) { setErrorMessage("Login required."); return; }
        if (!socketRef.current?.connected) { setErrorMessage("Connecting..."); socketRef.current?.connect(); return; }

        console.log(`Launching challenge for ${playerId}`);
        setIsMatchmaking(true);
        setErrorMessage(null);
        setStatusMessage("Joining lobby...");
        // *** Send only playerId ***
        socketRef.current.emit('joinMatchmaking', { playerId });
    };

     const handleCancelMatchmaking = () => {
         if (isMatchmaking && socketRef.current?.connected) {
             console.log("Cancelling matchmaking...");
             setStatusMessage("Leaving lobby...");
             socketRef.current.emit('leaveMatchmaking');
         }
     };


    return (
        <div className="matchmaking-container">
             <motion.div className="matchmaking-card" /* ... */ >
                 <div className="matchmaking-icon-container"> /* ... */ </div>
                 <h2 className="matchmaking-title">Ranked Duel</h2>
                <AnimatePresence mode="wait">
                    {isMatchmaking ? (
                        <motion.div key="waiting" className="matchmaking-status" /* ... */ >
                            <p className="status-message">{statusMessage}</p>
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                             <div className="spinner matchmaking">⚙️</div>
                             <button onClick={handleCancelMatchmaking} className="cancel-button">Cancel</button>
                        </motion.div>
                    ) : (
                         <motion.div key="idle" className="matchmaking-idle" /* ... */ >
                            <p className="matchmaking-description">Climb the ranks! Challenge players globally...</p>
                             {errorMessage && <p className="error-message idle">{errorMessage}</p>}
                            <button onClick={handleLaunchChallenge} className="launch-button" disabled={!playerId}>
                                { !playerId ? "Loading User..." : "Launch Challenge"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}