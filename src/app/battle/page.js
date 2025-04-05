// EquationGame.js - Complete Code with Final Leaderboard in Overlay

"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import "./battle.css"; // Base layout and meteors
import "./gameStyle.css"; // Game-specific elements, user panel, timer styling
import { motion, AnimatePresence } from 'framer-motion';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
    SortableContext, useSortable, horizontalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { stateDiffMakerFromState } from '../utils/stateDiff'; // Ensure this utility exists and is correct

// --- Constants ---
const SOCKET_SERVER_URL = "http://localhost:4000"; // Your backend server URL
const DEFAULT_GAME_DURATION = 60;

// --- Components ---

// Meteors Component
function Meteors() {
    const meteors = new Array(20).fill(true);
    return (
        <>
            {meteors.map((el, idx) => (
                <span
                    key={idx}
                    className="meteor"
                    style={{
                        left: `${Math.floor(Math.random() * 100)}vw`,
                        top: `${Math.floor(Math.random() * 100)}vh`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                    }}
                />
            ))}
        </>
    );
}

// SortableItem Component
function SortableItem({ id, value, isOperator, onRemove, isFixed, isSpectator, isTimeUp }) {
    const isDisabled = isFixed || isSpectator || isTimeUp;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isDisabled });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, touchAction: 'none' };
    const baseCursorStyle = isDisabled ? 'cursor-default' : (isOperator ? 'cursor-grab' : 'cursor-default');

    return (
        <motion.div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className={`sortable-item ${isOperator ? 'operator' : 'number'} ${isDisabled ? 'disabled' : ''} ${isDragging ? 'dragging' : ''}`}>
            {value}
            {isOperator && !isSpectator && !isTimeUp && (
                <button className="remove-button"
                    onClick={(e) => { e.stopPropagation(); onRemove(id); }} aria-label={`Remove operator ${value}`}>
                    ×
                </button>
            )}
        </motion.div>
    );
}

// Helper function
function arraysEqual(a, b) { // Basic check for ID arrays
    if (a === b) return true; if (a == null || b == null) return false; if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) { if (a[i] !== b[i]) return false; } return true;
}

// --- Main Game Component ---
export default function EquationGame() {
    const [states, setState] = useState([]);
    const router = useRouter();
    const searchParams = useSearchParams();
    const socketRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // --- State ---
    const [roomId, setRoomId] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [spectatingPlayerId, setSpectatingPlayerId] = useState(null);
    const [isSpectator, setIsSpectator] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [equation, setEquation] = useState([]);
    const [result, setResult] = useState(null);
    const [roomUsers, setRoomUsers] = useState([]); // Raw user list from server
    const [gameHasStarted, setGameHasStarted] = useState(false);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [gameStartError, setGameStartError] = useState(null);
    const [serverStartTime, setServerStartTime] = useState(null);
    const [gameDuration, setGameDuration] = useState(DEFAULT_GAME_DURATION);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_GAME_DURATION);
    const [isNavigating, setIsNavigating] = useState(false); // Prevent double navigation clicks

    // --- Refs ---
    const initialNumbers = useRef([
        {id: 'num-1', value: '1', type: 'number'}, {id: 'num-2', value: '2', type: 'number'},
        {id: 'num-3', value: '3', type: 'number'}, {id: 'num-4', value: '4', type: 'number'},
        {id: 'num-5', value: '5', type: 'number'}, {id: 'num-6', value: '6', type: 'number'},
    ]).current;

    const availableOps = ['+', '-', '×', '÷', '(', ')', '^'];
    const operatorValues = {'+': '+', '-': '-', '×': '*', '÷': '/', '(': '(', ')': ')', '^': '**'};

    const sensors = useSensors( useSensor(PointerSensor, { activationConstraint: { distance: 10 } }) );

    // --- Effects ---

    // Effect 1: Parse URL Params & Initial Setup
    useEffect(() => {
        const rId = searchParams.get('roomID');
        const pId = searchParams.get('playerID');
        const spectateId = searchParams.get('spectate');
        if (!rId) { console.error("Missing roomID"); return; }
        setRoomId(rId);

        // Reset state fully on param change
        setIsSpectator(false); setPlayerId(''); setSpectatingPlayerId(null);
        setEquation([]); setResult(null); setRoomUsers([]);
        setGameHasStarted(false); setIsTimeUp(false); setTimeLeft(DEFAULT_GAME_DURATION);
        setGameStartError(null); setState([]);
        setServerStartTime(null); setGameDuration(DEFAULT_GAME_DURATION);
        setIsNavigating(false); // Reset navigation lock

        if (spectateId) {
            setIsSpectator(true); setSpectatingPlayerId(spectateId);
        } else if (pId) {
            setIsSpectator(false); setPlayerId(pId);
        } else { console.error("Missing playerID or spectate parameter"); }

        if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }

    }, [searchParams]);

    // Effect 2: Socket.IO Connection & Event Handling
    useEffect(() => {
        if (!roomId || (!isSpectator && !playerId) || (isSpectator && !spectatingPlayerId)) return;

        if (socketRef.current) { socketRef.current.disconnect(); }

        // Ensure protocol is included for socket connection
        let serverUrl = SOCKET_SERVER_URL;
        if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
             serverUrl = 'http://' + serverUrl; // Default to http if none provided
        }

        socketRef.current = io(serverUrl, { reconnectionAttempts: 3 });
        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket: Connected!', socket.id);
            const joinPayload = { roomId, role: isSpectator ? 'spectator' : 'player', playerId: !isSpectator ? playerId : null, targetPlayerId: isSpectator ? spectatingPlayerId : null };
            socket.emit('joinRoom', joinPayload);
        });
        socket.on('disconnect', (reason) => {
             setIsConnected(false); setRoomUsers([]); setGameHasStarted(false);
             setServerStartTime(null); setTimeLeft(DEFAULT_GAME_DURATION); setIsTimeUp(false);
             if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
             console.log('Socket: Disconnected:', reason);
        });
        socket.on('connect_error', (error) => { setIsConnected(false); console.error('Socket: Connection Error:', error); }); // Log the actual error
        socket.on('errorJoining', (data) => { console.error('Socket: Error joining room:', data.message); });
        socket.on('joinedRoom', (data) => { console.log("Socket: Successfully joined room", data); });
        socket.on('gameStartError', ({ message }) => { setGameStartError(message); setTimeout(() => setGameStartError(null), 5000); });

        // *** Updated Listeners ***
        socket.on('roomUserListUpdate', (users) => {
            console.log('Socket: Received updated user list:', users);
            setRoomUsers(Array.isArray(users) ? users : []);
        });
        socket.on('gameHasStarted', ({ roomId: startedRoomId, gameStartTime, gameDuration: durationFromServer }) => {
            if (startedRoomId === roomId) {
                console.log(`Socket: Game started info received for room ${roomId}`);
                setGameHasStarted(true);
                setServerStartTime(gameStartTime);
                const duration = durationFromServer || DEFAULT_GAME_DURATION;
                setGameDuration(duration);
                setTimeLeft(duration);
                setIsTimeUp(false); // Ensure time up is reset
                setGameStartError(null);
                setResult(null); // Clear previous result

                if (!isSpectator) {
                    setEquation([...initialNumbers]);
                    setState([initialNumbers.map(e => e.value).join("")]);
                } else { setEquation([]); }

                if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
            }
        });
        socket.on('equationUpdated', (data) => {
             if (isSpectator && data.playerID === spectatingPlayerId && gameHasStarted) {
                 if (Array.isArray(data.equation)) { setEquation(data.equation); }
             }
         });
         socket.on('resultUpdated', (data) => {
             if (isSpectator && data.playerID === spectatingPlayerId && gameHasStarted) {
                 setResult(data.result);
             }
         });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
        };
    }, [roomId, playerId, isSpectator, spectatingPlayerId, initialNumbers]); // Rerun if IDs change

    // Effect 3: Synced Timer Logic
    useEffect(() => {
        if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }

        if (gameHasStarted && serverStartTime && !isTimeUp) {
            timerIntervalRef.current = setInterval(() => {
                const now = Date.now();
                const elapsedTimeMs = now - serverStartTime;
                const durationMs = gameDuration * 1000;
                const remainingMs = Math.max(0, durationMs - elapsedTimeMs);
                const remainingSeconds = Math.ceil(remainingMs / 1000);

                setTimeLeft(remainingSeconds);

                if (remainingMs <= 0) {
                    setIsTimeUp(true); // Set time up state
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }
            }, 500);

        } else if (!gameHasStarted || isTimeUp) {
             if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
             if (!gameHasStarted) { setTimeLeft(gameDuration); } // Show full duration before start
        }

        return () => { if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; } };
    }, [gameHasStarted, serverStartTime, gameDuration, isTimeUp]);

    // Effect 4: Handling Time Up State
    useEffect(() => {
        if (isTimeUp) {
            console.log("Time's up! Game ended. User can now navigate.");
            // Just set the state, the UI will show the button
        }
    }, [isTimeUp]);


    // --- Game Logic Functions ---
    const emitUpdate = (type, payload) => {
        if (socketRef.current?.connected && !isSpectator && gameHasStarted && !isTimeUp) {
            socketRef.current.emit(type, { roomId, playerId, ...payload });
        }
    }

    const addOperator = (op) => {
        if (isSpectator || !gameHasStarted || isTimeUp) return;
        const newId = `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const newItem = { id: newId, value: op, type: 'operator' };
        const newEquation = [...equation, newItem];
        setState(s => [...s, newEquation.map(e => e.value).join("")]);
        setEquation(newEquation);
        emitUpdate('updateEquation', { equation: newEquation });
    };

    const removeOperator = (idToRemove) => {
        if (isSpectator || !gameHasStarted || isTimeUp) return;
        const newEquation = equation.filter(item => item.id !== idToRemove || item.type !== 'operator');
        if (newEquation.length < equation.length) {
            setState(s => [...s, newEquation.map(e => e.value).join("")]);
            setEquation(newEquation);
            emitUpdate('updateEquation', { equation: newEquation });
        }
    };

    const handleDragEnd = (event) => {
        if (isSpectator || !gameHasStarted || isTimeUp) return;
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const activeItem = equation.find(item => item.id === active.id);
        if (!activeItem || activeItem.type !== 'operator') return;

        const oldIndex = equation.findIndex(item => item.id === active.id);
        const newIndex = equation.findIndex(item => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        let potentialEq = arrayMove(equation, oldIndex, newIndex);
        const originalNums = equation.filter(i => i.type === 'number').map(i => i.id);
        const newNums = potentialEq.filter(i => i.type === 'number').map(i => i.id);
        if (!arraysEqual(originalNums, newNums)) { console.warn("Invalid move: Number order changed."); return; }

        setState(s => [...s, potentialEq.map(e => e.value).join("")]);
        setEquation(potentialEq);
        emitUpdate('updateEquation', { equation: potentialEq });
    };

    const calculateResult = () => {
        if (isSpectator || !gameHasStarted || isTimeUp) return;
        let calculatedResult; let resultMessage = ''; let equationString = '';
        try {
            equation.forEach(item => { equationString += operatorValues[item.value] || item.value; });
            if (equation.length === 0) throw new Error("Equation is empty.");
            if (!equationString && equation.length > 0) throw new Error("Invalid characters in equation.");
            // Basic Validations
            if (/^[\*\/\^\)]/.test(equationString) || /[\+\-\*\/\^\(]$/.test(equationString)) throw new Error("Starts/Ends with invalid operator.");
            if (/[\+\-\*\/^]{2,}/.test(equationString.replace(/\*\*+/g,'^'))) throw new Error("Consecutive operators.");
            if ((equationString.match(/\(/g) || []).length !== (equationString.match(/\)/g) || []).length) throw new Error("Mismatched parentheses.");
            if (/\([\*\/\^\)]/.test(equationString) || /[\+\-\*\/\^\(]\)/.test(equationString)) throw new Error("Invalid ops near parentheses.");
            if (/\(\)/.test(equationString)) throw new Error("Empty parentheses.");

            console.warn("Using Function constructor. Ensure input is controlled.");
            calculatedResult = new Function(`return ${equationString}`)();

            if (typeof calculatedResult !== 'number' || !isFinite(calculatedResult)) throw new Error("Calculation resulted in non-finite number.");
            calculatedResult = Math.round(calculatedResult * 10000) / 10000;
            resultMessage = calculatedResult === 100 ? `Success! You reached 100!` : `Result: ${calculatedResult} (Goal: 100)`;

            if (calculatedResult === 100 && socketRef.current?.connected) {
                console.log("Local Success! Emitting playerSolved");
                socketRef.current.emit('playerSolved', { roomId, playerId });
            }
        } catch (error) {
            console.error("Calculation error:", error, "Equation string:", equationString);
            resultMessage = `Error: ${error.message || "Invalid equation."}`; calculatedResult = null;
        }
        setResult(resultMessage);
        emitUpdate('updateResult', { result: resultMessage });
    };

    const resetGame = () => {
        if (isSpectator || !gameHasStarted || isTimeUp) return;
        const resetEquation = [...initialNumbers];
        setState(s => [...s, resetEquation.map(e => e.value).join("")]);
        setEquation(resetEquation);
        setResult(null);
        emitUpdate('updateEquation', { equation: resetEquation });
        emitUpdate('updateResult', { result: null });
    };

    const handleStartGame = () => {
        if (!isSpectator && isConnected && roomId && roomUsers.length >= 2 && !gameHasStarted) {
            setGameStartError(null);
            socketRef.current.emit('startGame', roomId);
        } else {
             let errorMsg = "Cannot start game.";
             if (!isConnected) errorMsg = "Not connected to server.";
             else if (roomUsers.length < 2) errorMsg = "Need at least 2 users.";
             else if (gameHasStarted) errorMsg = "Game already in progress.";
             setGameStartError(errorMsg);
             setTimeout(() => setGameStartError(null), 4000);
        }
    };

    // --- Navigation Handler ---
    const handleGoToReview = async () => {
        if (isNavigating) return;
        setIsNavigating(true);
        console.log("Attempting to navigate to review page...");

        try {
            if (!isSpectator && playerId) {
                console.log("Saving player state before navigating...");
                // Ensure stateDiffMakerFromState handles potential empty states array
                const stateHistory = states.length > 0 ? states : [initialNumbers.map(e => e.value).join("")];
                await fetch(`/api/games/${playerId}/review`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: playerId,
                        digits: initialNumbers.map(e => e.value),
                        state: stateDiffMakerFromState(initialNumbers.map(e => e.value), stateHistory)
                    })
                });
                console.log("Player state save request sent.");
            }
            router.push(`/review/${roomId}`);
        } catch (error) {
            console.error("Error during save or navigation:", error);
            // Navigate anyway if saving fails? Or show error?
            router.push(`/review/${roomId}`);
        }
        // No need to setIsNavigating(false) typically, as component will unmount
    };


    // --- Memoized Sorted Player List for Rendering ---
    const rankedPlayers = useMemo(() => {
        const players = roomUsers.filter(user => user.role === 'player' && user.playerId);
        const defaultUnsolvedRank = (gameDuration + 1) * 1000;
        const getRankKey = (player) => player.solvedTime === null ? defaultUnsolvedRank : player.solvedTime;
        return players.sort((a, b) => getRankKey(a) - getRankKey(b));
    }, [roomUsers, gameDuration]);

    // --- Render Functions ---
    const renderRankedUser = (player, index, isFinal = false) => {
        const rank = index + 1;
        let status = "Playing...";
        if (player.solvedTime !== null) { status = `Solved: ${(player.solvedTime / 1000).toFixed(2)}s`; }
        else if (isTimeUp) { status = "Time Up"; }

        const baseClassName = isFinal ? "final-leaderboard-item" : "user-panel-item";
        const detailsClassName = isFinal ? "final-leaderboard-details" : "user-details ranked";
        const idClassName = isFinal ? "final-player-id" : "player-id";
        const statusClassName = isFinal ? "final-player-status" : "player-status";

        return (
            <motion.li key={player.uniqueId} className={`${baseClassName} ${player.role} ${player.solvedTime !== null ? 'solved' : ''}`}
                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} layout >
                <span className={isFinal ? "final-rank-number" : "rank-number"}>{rank}.</span>
                <span className={`role-icon player-icon`}>🎮</span>
                <span className={detailsClassName}>
                    <span className={idClassName}>{player.playerId}</span>
                    <span className={statusClassName}>{status}</span>
                </span>
            </motion.li>
        );
    };

    const renderLobbyUser = (user) => {
         return (
            <motion.li key={user.uniqueId} className={`user-panel-item ${user.role}`}
                initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} layout >
                <span className={`role-icon ${user.role === 'player' ? 'player-icon' : 'spectator-icon'}`}>
                    {user.role === 'player' ? '🎮' : '👁️'}
                </span>
                <span className="user-details">
                    {user.role === 'player' ? `Player: ${user.playerId || '...'}` : `Spectator (Watching ${user.targetPlayerId || '...'})`}
                </span>
            </motion.li>
        );
    }

    // --- Main Render ---
    const canStartGame = !isSpectator && isConnected && roomUsers.length >= 2 && !gameHasStarted;

    return (
        <div className="game-container">
            <Meteors />

            {/* --- Top Left User Panel --- */}
            <div className="user-panel">
                <h3 className="user-panel-title">
                    {gameHasStarted ? `Leaderboard (${rankedPlayers.length})` : `Connected Users (${roomUsers.length})`}
                </h3>
                <ul className="user-panel-list">
                    <AnimatePresence>
                        {gameHasStarted
                            ? rankedPlayers.map((player, index) => renderRankedUser(player, index, false)) // isFinal = false for panel
                            : roomUsers.map(renderLobbyUser)
                        }
                    </AnimatePresence>
                    {gameHasStarted && rankedPlayers.length === 0 && <p className="no-users-message">No players yet.</p>}
                    {!gameHasStarted && roomUsers.length === 0 && <p className="no-users-message">Waiting for users...</p>}
                </ul>
                {!isSpectator && !gameHasStarted && (
                     <motion.button className="start-game-button-panel" onClick={handleStartGame} disabled={!canStartGame}
                         whileHover={canStartGame ? { scale: 1.05 } : {}} whileTap={canStartGame ? { scale: 0.95 } : {}}
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} >
                         {roomUsers.length < 2 ? 'Waiting for Players...' : 'Start Game'}
                     </motion.button>
                 )}
                {gameHasStarted && !isTimeUp && ( <motion.p className="game-status-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Game In Progress</motion.p> )}
                {isTimeUp && ( <motion.p className="game-status-message timeup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Game Over</motion.p> )}
                {gameStartError && ( <p className="game-start-error-panel">{gameStartError}</p> )}
            </div>

            {/* --- Top Right Timer --- */}
            {(gameHasStarted || isTimeUp) && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="timer-display">
                    <p className="timer-label">Time Left</p>
                    <p className={`timer-value ${timeLeft <= 10 && !isTimeUp ? 'low-time' : ''} ${isTimeUp ? 'timeup-value' : ''}`}>{timeLeft}s</p>
                </motion.div>
            )}

            {/* --- Top Center Header --- */}
            <nav className="game-header">
                <h1>
                    Hactoclash - {isSpectator ? `Spectating ${spectatingPlayerId}` : `Player ${playerId}`} (Room: {roomId})
                    <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`} title={isConnected ? 'Connected' : 'Disconnected'}></span>
                </h1>
            </nav>

            {/* --- Main Game Area (Centered) --- */}
            <div className="main-game-area">
                <AnimatePresence mode="wait">
                    {!gameHasStarted ? (
                        <motion.div key="waiting" className="waiting-message"
                             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <h2>Waiting for game to start...</h2>
                            <p>{isSpectator ? 'Waiting for the player to start.' : roomUsers.length < 2 ? 'Need at least 2 users to start.' : 'Press "Start Game" when ready.'}</p>
                            <div className="spinner">⚙️</div>
                        </motion.div>
                    ) : (
                        <motion.div key="game-active" className="active-game-content"
                             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Equation Box */}
                            <div className="equation-box">
                                <h2 className="box-title">{isSpectator ? `Player ${spectatingPlayerId}'s Equation` : 'Your Equation'}</h2>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={equation.map(item => item.id)} strategy={horizontalListSortingStrategy}>
                                        <div className="equation-items-container">
                                            {equation.map(item => (
                                                <SortableItem key={item.id} id={item.id} value={item.value}
                                                            isOperator={item.type === 'operator'} isFixed={item.type === 'number'}
                                                            onRemove={removeOperator} isSpectator={isSpectator} isTimeUp={isTimeUp} />
                                            ))}
                                            {equation.length === 0 && <p className="equation-placeholder">{isSpectator ? "Waiting..." : "Build your equation!"}</p>}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                                {!isSpectator && !isTimeUp && <div className="hint-text">Drag operators (purple). Numbers (grey) are fixed.</div>}
                                {isSpectator && <div className="hint-text spectator">Spectating.</div>}
                                {isTimeUp && <div className="hint-text timeup">Time's Up!</div>}
                            </div>

                            {/* Operator Selection */}
                            {!isSpectator && !isTimeUp && (
                                <div className="operators-box">
                                    <h2 className="box-title">Add Operators</h2>
                                    <div className="operators-grid">
                                        {availableOps.map(op => ( <motion.button key={op} className="operator-button" onClick={() => addOperator(op)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>{op}</motion.button> ))}
                                    </div>
                                </div>
                            )}

                            {/* Control Buttons */}
                            <div className="control-buttons">
                                <motion.button className="game-button calculate" onClick={calculateResult} whileHover={(isSpectator || isTimeUp) ? {} : { scale: 1.05 }} whileTap={(isSpectator || isTimeUp) ? {} : { scale: 0.95 }} disabled={isSpectator || isTimeUp}>Calculate</motion.button>
                                <motion.button className="game-button reset" onClick={resetGame} whileHover={(isSpectator || isTimeUp) ? {} : { scale: 1.05 }} whileTap={(isSpectator || isTimeUp) ? {} : { scale: 0.95 }} disabled={isSpectator || isTimeUp}>Reset</motion.button>
                            </div>

                            {/* Result Display */}
                            {result && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result-display">
                                    <p className={`result-text ${result.startsWith('Success') ? 'success' : result.startsWith('Error') ? 'error' : ''}`}>{result}</p>
                                </motion.div>
                            )}
                        </motion.div> // End Active Game
                    )}
                </AnimatePresence>

                 {/* --- Updated Time's Up Overlay --- */}
                 {isTimeUp && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="timeup-overlay">
                         <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 100 }} className="timeup-message-box with-leaderboard">
                            <p className="timeup-title">Time's up!</p>
                            <p className="timeup-subtitle">Final Standings:</p>
                            <div className="final-summary-container">
                                <div className="final-leaderboard">
                                     <ul className="final-leaderboard-list">
                                         <AnimatePresence>
                                             {rankedPlayers.map((player, index) => renderRankedUser(player, index, true))} {/* isFinal = true */}
                                         </AnimatePresence>
                                         {rankedPlayers.length === 0 && <p className="no-users-message final">No players participated.</p>}
                                     </ul>
                                </div>
                                <div className="final-button-container">
                                     <motion.button className="game-button view-analysis-button" onClick={handleGoToReview} disabled={isNavigating} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                                         {isNavigating ? "Loading..." : "View Analysis"}
                                     </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>

             {/* Bottom Left Icon */}
             <div className="bottom-left-icon">N</div>
        </div>
    );
}