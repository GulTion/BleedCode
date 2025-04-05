// EquationGame.js - Complete JAVASCRIPT Code with D&D and Socket Integration

"use client"; // Still needed for Next.js App Router components using hooks

import { useState, useEffect, useRef } from 'react';
import "./battle.css"; // Make sure this CSS file exists and is correctly styled
import { motion } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
    // DragEndEvent type removed for JS
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    horizontalListSortingStrategy,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSearchParams } from 'next/navigation';
import io from 'socket.io-client'; // Base import for socket.io client
// Socket type import removed for JS

// --- Constants ---
const SOCKET_SERVER_URL = "http://192.168.17.138:4000"; // Matches your server setup

// --- Components ---

// Meteors Component (Keep as provided before)
function Meteors() {
    const meteors = new Array(20).fill(true);
    return (
      <>
        {meteors.map((el, idx) => (
          <span
            key={idx}
            className="meteor" // Ensure CSS for .meteor exists
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

// SortableItem Component (Corrected JS version)
function SortableItem({id, value, isOperator, onRemove, isFixed, isSpectator}) {
  const isDisabled = isFixed || isSpectator; // Numbers and spectators cannot drag/sort

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id,
    disabled: isDisabled // Correctly pass disabled state to the hook
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const baseCursorStyle = isDisabled ? 'cursor-default' : 'cursor-grab';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes} // Required for dnd-kit
      {...listeners} // Required for dnd-kit (hook handles disabling)
      className={`relative ${isOperator ? 'bg-[#8B5CF6]' : 'bg-[#2D3748]'} p-4 rounded-xl text-xl font-bold ${baseCursorStyle} ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      {value}
      {/* Remove button only shown to non-spectator players for operators */}
      {isOperator && !isSpectator && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs z-10 hover:bg-red-700"
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag from starting on button click
            onRemove(id);
          }}
          aria-label={`Remove operator ${value}`}
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

// Helper function (Keep as is)
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}


// --- Main Game Component (JavaScript Version) ---
export default function EquationGame() {
  const searchParams = useSearchParams();
  // --- Socket.IO Ref ---
  const socketRef = useRef(null); // Holds the socket connection (no type hint)

  // --- State ---
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState(''); // This client's player ID (if playing)
  const [spectatingPlayerId, setSpectatingPlayerId] = useState(null); // ID of player being watched (null initially)
  const [isSpectator, setIsSpectator] = useState(false); // Is this client a spectator?
  const [isConnected, setIsConnected] = useState(false); // Socket connection status

  // Initial numbers setup (using useRef as it's static based on component load)
  const initialNumbers = useRef([
    {id: 'num-1', value: '1', type: 'number'},
    {id: 'num-2', value: '2', type: 'number'},
    {id: 'num-3', value: '3', type: 'number'},
    {id: 'num-4', value: '4', type: 'number'},
    {id: 'num-5', value: '5', type: 'number'},
    {id: 'num-6', value: '6', type: 'number'},
  ]).current;

  const [equation, setEquation] = useState([...initialNumbers]); // Current equation state
  const [result, setResult] = useState(null); // Calculation result/message (null initially)

  const availableOps = ['+', '-', '×', '÷', '(', ')', '^'];
  const operatorValues = {'+': '+', '-': '-', '×': '*', '÷': '/', '(': '(', ')': ')', '^': '**'}; // For calculation

  // Setup for dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // Prevent accidental drags
    })
  );

  // --- Effects ---

  // Effect 1: Parse URL Parameters
  useEffect(() => {
    const rId = searchParams.get('roomID');
    const pId = searchParams.get('playerID');
    const spectateId = searchParams.get('spectate');

    console.log("URL Params:", { rId, pId, spectateId });

    if (!rId) {
        console.error("Missing roomID parameter in URL");
        return;
    }
    setRoomId(rId);

    if (spectateId) {
      // Spectator Mode
      setIsSpectator(true);
      setSpectatingPlayerId(spectateId);
      setPlayerId('');
      console.log(`Setting up as spectator for player ${spectateId} in room ${rId}`);
      setEquation([...initialNumbers]);
      setResult(null);
    } else if (pId) {
      // Player Mode
      setIsSpectator(false);
      setPlayerId(pId);
      setSpectatingPlayerId(null);
      console.log(`Setting up as player ${pId} in room ${rId}`);
      setEquation([...initialNumbers]);
      setResult(null);
    } else {
      console.error("Missing playerID or spectate parameter in URL");
    }
  }, [searchParams, initialNumbers]); // Rerun if URL params change


  // --- Socket.IO Effect (JavaScript Version) ---
  useEffect(() => {
    // Guard: Only connect if we have the necessary IDs
    if (!roomId || (!isSpectator && !playerId) || (isSpectator && !spectatingPlayerId)) {
      console.log("Socket: Waiting for room/player/spectator identification...");
      return () => {
         if (socketRef.current) {
            console.log("Socket: Disconnecting in cleanup (pre-connection phase)...");
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
         }
      };
    }

    console.log(`Socket: Attempting connection. Role: ${isSpectator ? 'Spectator' : 'Player'}, PlayerID: ${playerId}, Spectating: ${spectatingPlayerId}`);

    if (socketRef.current?.connected) {
        console.log("Socket: Already connected.");
        return;
    }
     if (socketRef.current) {
         console.log("Socket: Disconnecting existing socket before creating new one...");
         socketRef.current.disconnect();
     }

    // *** Establish Connection ***
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });
    const socket = socketRef.current;

    // --- Socket Event Handlers ---
    socket.on('connect', () => {
      console.log('Socket: Connected!', socket.id);
      setIsConnected(true);

      // *** Join Room ***
      const joinPayload = {
        roomId: roomId,
        role: isSpectator ? 'spectator' : 'player',
        playerId: !isSpectator ? playerId : null,
        targetPlayerId: isSpectator ? spectatingPlayerId : null
      };
      console.log("Socket: Emitting joinRoom:", joinPayload);
      socket.emit('joinRoom', joinPayload);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket: Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket: Connection Error:', error);
      setIsConnected(false);
    });

    socket.on('errorJoining', (data) => {
        console.error('Socket: Error joining room:', data.message);
     });

     // --- Listener for Spectators: Equation Updates ---
    socket.on('equationUpdated', (data) => {
      if (isSpectator && data.playerID === spectatingPlayerId) {
        console.log(`Socket: Received equation update for player ${data.playerID}:`, data.equation);
        if (Array.isArray(data.equation)) {
            setEquation(data.equation);
        } else {
            console.error("Socket: Received invalid equation data format:", data.equation);
        }
      }
    });

    // --- Listener for Spectators: Result Updates ---
    socket.on('resultUpdated', (data) => {
       if (isSpectator && data.playerID === spectatingPlayerId) {
         console.log(`Socket: Received result update for player ${data.playerID}:`, data.result);
         setResult(data.result);
       }
    });

    // Optional: Listen for 'joinedRoom' confirmation
    socket.on('joinedRoom', (data) => {
        console.log("Socket: Successfully joined room", data);
    });

    // --- Cleanup Function ---
    return () => {
      if (socketRef.current) {
        console.log("Socket: Disconnecting socket in cleanup for:", { roomId, playerId, isSpectator, spectatingPlayerId });
        // Remove specific listeners
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('errorJoining');
        socketRef.current.off('equationUpdated');
        socketRef.current.off('resultUpdated');
        socketRef.current.off('joinedRoom');
        // Disconnect
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  // Dependencies
  }, [roomId, playerId, isSpectator, spectatingPlayerId]);


  // --- Game Logic Functions (JavaScript Version) ---

  // *** Helper to Emit Updates (for Players only) ***
  const emitUpdate = (type, payload) => {
      if (socketRef.current?.connected && !isSpectator && roomId && playerId) {
          console.log(`Socket: Emitting ${type} for player ${playerId} in room ${roomId}:`, payload);
          socketRef.current.emit(type, {
              roomId,
              playerId,
              ...payload
          });
      } else if (!isSpectator) {
          console.warn(`Socket: Cannot emit update (${type}). Conditions not met:`, {
              connected: socketRef.current?.connected,
              isSpectator,
              roomId,
              playerId
          });
      }
  }

  // Add operator
  const addOperator = (op) => {
    if (isSpectator) return;
    const newId = `op-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newItem = { id: newId, value: op, type: 'operator' };
    const newEquation = [...equation, newItem];
    setEquation(newEquation);
    emitUpdate('updateEquation', { equation: newEquation });
  };

  // Remove operator
  const removeOperator = (idToRemove) => {
    if (isSpectator) return;
    let itemRemoved = false;
    const newEquation = equation.filter(item => {
        if (item.id === idToRemove && item.type === 'operator') {
            itemRemoved = true;
            return false;
        }
        return true;
    });
    if (itemRemoved) {
        setEquation(newEquation);
        emitUpdate('updateEquation', { equation: newEquation });
    } else {
        console.warn(`Attempted to remove item with id ${idToRemove}, but it wasn't found or wasn't an operator.`);
    }
  };

  // Handle drag end (JavaScript Version - no DragEndEvent type)
  const handleDragEnd = (event) => {
    if (isSpectator) return;
    const { active, over } = event;
    console.log("DND: DragEnd event", event);
    if (!over || active.id === over.id) return;

    const activeItem = equation.find(item => item.id === active.id);
    if (!activeItem || activeItem.type !== 'operator') {
        console.warn("DND: Attempted to drag a non-operator:", activeItem);
        return;
    }

    const oldIndex = equation.findIndex(item => item.id === active.id);
    const newIndex = equation.findIndex(item => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
        console.error("DND: Indices not found for drag items.");
        return;
    }

    let potentiallyNewEquation = arrayMove(equation, oldIndex, newIndex);

    // --- Validation: Ensure numbers maintain relative order ---
    const originalNumberIds = equation.filter(item => item.type === 'number').map(item => item.id);
    const newNumberIds = potentiallyNewEquation.filter(item => item.type === 'number').map(item => item.id);
    if (!arraysEqual(originalNumberIds, newNumberIds)) {
        console.warn("DND: Invalid move - Number order would change. Reverting.");
        return;
    }
    // --- End Validation ---

    setEquation(potentiallyNewEquation);
    emitUpdate('updateEquation', { equation: potentiallyNewEquation });
  };


  // Calculate result (JavaScript Version)
  const calculateResult = () => {
    if (isSpectator) return;
    let calculatedResult;
    let resultMessage = '';
    let equationString = '';

    try {
      equation.forEach(item => {
        equationString += operatorValues[item.value] || item.value;
      });
      console.log("Calculating:", equationString);

       // --- Input Validations (Keep these) ---
       if (!equationString) throw new Error("Equation is empty.");
       if (/^[\*\/\^\)]/.test(equationString) || /[\+\-\*\/\^\(]$/.test(equationString)) throw new Error("Equation starts or ends invalidly.");
       if (/[\+\-\*\/^]{2,}/.test(equationString.replace(/\*\*+/g,'^'))) throw new Error("Consecutive operators.");
       if ((equationString.match(/\(/g) || []).length !== (equationString.match(/\)/g) || []).length) throw new Error("Mismatched parentheses.");
       if (/\([\*\/\^\)]/.test(equationString) || /[\+\-\*\/\^\(]\)/.test(equationString)) throw new Error("Invalid operator placement near parentheses.");
       if (/\(\)/.test(equationString)) throw new Error("Empty parentheses found.");

      // --- EVAL WARNING (Keep this) ---
      console.warn("Using eval() for calculation. Ensure input is strictly controlled via UI. Consider a math parser library for production.");
      calculatedResult = eval(equationString);
      // --- End Warning ---

      if (typeof calculatedResult !== 'number' || !isFinite(calculatedResult)) {
        throw new Error(`Calculation Result Invalid: ${calculatedResult}`);
      }
      calculatedResult = Math.round(calculatedResult * 10000) / 10000;

      if (calculatedResult === 100) {
        resultMessage = `Success! You reached 100!`;
      } else {
        resultMessage = `Result: ${calculatedResult} (Goal: 100)`;
      }

    } catch (error) {
      console.error("Calculation error:", error);
      resultMessage = `Error: ${error.message || "Invalid equation."}`;
      calculatedResult = null;
    }

    setResult(resultMessage);
    emitUpdate('updateResult', { result: resultMessage });
  };

  // Reset game (JavaScript Version)
  const resetGame = () => {
    if (isSpectator) return;
    const resetEquation = [...initialNumbers];
    const resetResult = null;
    setEquation(resetEquation);
    setResult(resetResult);
    emitUpdate('updateEquation', { equation: resetEquation });
    emitUpdate('updateResult', { result: resetResult });
  };


  // --- Render (JSX remains the same) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0E18] to-[#1A1B41] text-white flex flex-col relative overflow-hidden">
      <Meteors />
      {/* Navigation Bar */}
      <nav className="bg-[#111827] py-4 px-6 shadow-md relative z-10">
         <h1 className="text-center text-xl font-bold text-[#8B5CF6]">
          Hactoclash - {isSpectator ? `Spectating Player ${spectatingPlayerId}` : `Player ${playerId}`} (Room: {roomId})
          {/* Connection Status Indicator */}
          <span
            className={`ml-3 inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          ></span>
        </h1>
      </nav>

      {/* Main Game Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-3xl mx-auto">

          {/* Equation Display Area */}
          <div className="bg-[#111827]/60 backdrop-blur-md p-6 rounded-xl mb-8 border border-[#1E293B] min-h-[100px]">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {isSpectator ? `Player ${spectatingPlayerId}'s Equation` : 'Your Equation'}
            </h2>

            {/* Drag and Drop Context */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={equation.map(item => item.id)}
                strategy={horizontalListSortingStrategy}
              >
                {/* Container for Sortable Items */}
                <div className="flex flex-wrap justify-center items-center gap-3 mb-4 p-2 bg-gray-900/30 rounded min-h-[60px]">
                  {/* Display Placeholder or Equation Items */}
                  {equation.length === 0 && !isSpectator && (
                    <p className="text-gray-400 italic">Add operators below.</p>
                  )}
                   {equation.length === 0 && isSpectator && (
                    <p className="text-gray-400 italic">Waiting for player action...</p>
                  )}
                  {/* Render each item using SortableItem */}
                  {equation.map(item => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      value={item.value}
                      isOperator={item.type === 'operator'}
                      isFixed={item.type === 'number'}
                      onRemove={removeOperator}
                      isSpectator={isSpectator}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Hint Text */}
            {!isSpectator && (
              <div className="text-sm text-gray-400 mt-2 text-center">
                Drag operators to rearrange. Click (×) to remove. Numbers are fixed.
              </div>
            )}
            {isSpectator && (
              <div className="text-sm text-yellow-400 mt-2 text-center">
                You are spectating. Controls are disabled.
              </div>
            )}
          </div>

          {/* Operator Selection (Only for Players) */}
          {!isSpectator && (
            <div className="bg-[#111827]/60 backdrop-blur-md p-6 rounded-xl mb-8 border border-[#1E293B]">
              <h2 className="text-2xl font-bold mb-6 text-center">Add Operators</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {availableOps.map(op => (
                  <motion.button
                    key={op}
                    className="w-16 h-16 bg-[#8B5CF6] rounded-xl text-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => addOperator(op)}
                    whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(138, 91, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isSpectator}
                    aria-label={`Add operator ${op}`}
                  >
                    {op}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Control Buttons (Calculate, Reset) */}
          <div className="flex justify-center gap-6 mb-8">
            <motion.button
              className="px-8 py-4 bg-[#8B5CF6] rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={calculateResult}
              whileHover={isSpectator ? {} : { scale: 1.05, boxShadow: "0 0 15px rgba(138, 91, 246, 0.5)" }}
              whileTap={isSpectator ? {} : { scale: 0.95 }}
              disabled={isSpectator}
            >
              Calculate
            </motion.button>

            <motion.button
              className="px-8 py-4 bg-[#4A5568] hover:bg-[#2D3748] rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={resetGame}
              whileHover={isSpectator ? {} : { scale: 1.05 }}
              whileTap={isSpectator ? {} : { scale: 0.95 }}
              disabled={isSpectator}
            >
              Reset
            </motion.button>
          </div>

          {/* Result Display Area */}
          {result && (
            <div className="text-center p-4 bg-[#111827]/60 backdrop-blur-md rounded-xl border border-[#1E293B] min-h-[50px] flex items-center justify-center">
              <p className={`text-xl font-semibold ${result.startsWith('Success') ? 'text-green-400' : result.startsWith('Error') ? 'text-red-400' : ''}`}>
                {result}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}