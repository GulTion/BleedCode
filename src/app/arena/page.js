"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Meteor component for background animation
function Meteors() {
  useEffect(() => {
    const createMeteor = () => {
      const meteor = document.createElement('div');
      meteor.className = 'meteor';

      // Random size and position
      const size = Math.random() * 3 + 1;
      meteor.style.width = `${size}px`;
      meteor.style.height = `${size * 15}px`;
      meteor.style.top = `${Math.random() * 100}%`;
      meteor.style.left = `${Math.random() * 100}%`;

      // Random animation duration
      const duration = Math.random() * 3 + 2;
      meteor.style.animationDuration = `${duration}s`;

      document.querySelector('.meteors-container').appendChild(meteor);

      // Remove meteor after animation completes
      setTimeout(() => {
        meteor.remove();
      }, duration * 1000);
    };

    // Create meteors at intervals
    const interval = setInterval(() => {
      createMeteor();
    }, 300);

    // Initial meteors
    for (let i = 0; i < 10; i++) {
      setTimeout(createMeteor, Math.random() * 2000);
    }

    return () => clearInterval(interval);
  }, []);

  return <div className="meteors-container absolute inset-0 pointer-events-none overflow-hidden"></div>;
}

// Sortable item component (for both numbers and operators)
function SortableItem({ id, value, isOperator, onRemove, isFixed }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...(isFixed ? {} : attributes)}
      {...(isFixed ? {} : listeners)}
      className={`relative ${isOperator ? 'bg-[#8B5CF6]' : 'bg-[#2D3748]'} p-4 rounded-xl text-xl font-bold ${
        isFixed ? '' : 'cursor-grab active:cursor-grabbing'
      }`}
      whileHover={isFixed ? {} : { scale: 1.05 }}
    >
      {value}
      {isOperator && (
        <button
          className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          ×
        </button>
      )}
    </motion.div>
  );
}

export default function EquationGame() {
  // Full equation items (both numbers and operators)
  const [equation, setEquation] = useState([
    { id: 'num-1', value: '1', type: 'number' },
    { id: 'num-2', value: '2', type: 'number' },
    { id: 'num-3', value: '3', type: 'number' },
    { id: 'num-4', value: '4', type: 'number' },
    { id: 'num-5', value: '5', type: 'number' },
    { id: 'num-6', value: '6', type: 'number' },
  ]);

  const [result, setResult] = useState(null);

  // Available operators
  const availableOps = ['+', '-', '*', '/', '^','(',')'];
  const operatorValues = { '+': '+', '-': '-', '*': '*', '/': '/', '^': '**','(':'(',')':')' };

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Add operator to end of equation
  const addOperator = (op) => {
    const newId = `op-${Date.now()}`;
    setEquation([...equation, { id: newId, value: op, type: 'operator' }]);
  };

  // Remove operator
  const removeOperator = (id) => {
    setEquation(equation.filter((item) => item.id !== id));
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    setEquation((items) => {
      // Find the indices
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Only allow moving operators
      if (items[oldIndex].type !== 'operator') return items;

      // Create a new array with the moved item
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      return newItems;
    });
  };

  // Calculate result
  const calculateResult = () => {
    try {
      let equationString = '';

      equation.forEach((item) => {
        if (item.type === 'number') {
          equationString += item.value;
        } else {
          equationString += operatorValues[item.value] || item.value;
        }
      });

      equationString = equationString.replace(/\^/g, '**');

      const calculatedResult = eval(equationString);

      if (calculatedResult === 100) {
        setResult(`Success! The equation equals ${calculatedResult}`);
      } else {
        setResult(`Result: ${calculatedResult} (not yet equal to ${100})`);
      }
    } catch (error) {
      setResult('Invalid equation. Check your operators.');
    }
  };

  // Reset everything
  const resetGame = () => {
    setEquation(equation.filter((item) => item.type === 'number'));
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0E18] to-[#1A1B41] text-white flex flex-col relative overflow-hidden">
      
      {/* Shooting meteors in background */}
      <Meteors />
      
      {/* Navbar */}
      <nav className="bg-[#111827] py-4 px-6 shadow-md relative z-10">
        <h1 className="text-center text-xl font-bold text-[#8B5CF6]">Hactoclash</h1>
      </nav>
      
     {/* Main Content */}
     <div className="flex-grow flex items-center justify-center relative z-10">
        <div className="max-w-[90%] mx-auto p-4">
          {/* Equation Display */}
          <div className="bg-[#111827]/50 p-6 rounded-xl mb-8 w-full">
            <h2 className="text-2xl font-bold mb-6">Your Equation</h2>
            
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={equation.map(item => item.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div className="flex justify-between gap-[15px] mb-[20px]">
                  {equation.map(item => (
                    <SortableItem 
                      key={item.id} 
                      id={item.id} 
                      value={item.value} 
                      isOperator={item.type === 'operator'}
                      isFixed={item.type === 'number'}
                      onRemove={removeOperator}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            <div className="text-sm text-gray-400 mt-[10px]">
              Drag operators to rearrange them. They will be placed between numbers.
            </div>
          </div>
          {/* Operator Selection */}
          <div className="bg-[#111827]/50 backdrop-blur-md p-6 rounded-xl mb-8 border border-[#1E293B]">
            <h2 className="text-2xl font-bold mb-6">Add Operators</h2>
            <div className="flex flex-wrap gap-3">
              {availableOps.map(op => (
                <motion.button
                  key={op}
                  className="w-16 h-16 bg-[#8B5CF6] rounded-xl text-xl font-bold"
                  onClick={() => addOperator(op)}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(138, 43, 226, 0.6)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {op}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex justify-center gap-6 mb-8">
            <motion.button 
              className="px-8 py-4 bg-[#8B5CF6] rounded-xl text-lg font-semibold"
              onClick={calculateResult}
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(138, 43, 226, 0.6)" }}
              whileTap={{ scale: 0.95 }}
            >
              Calculate
            </motion.button>
            
            <motion.button 
              className="px-8 py-4 bg-[#2D3748] rounded-xl text-lg font-semibold"
              onClick={resetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Reset
            </motion.button>
          </div>
          
          {/* Result */}
          {result && (
            <div className="text-center p-4 bg-[#111827]/50 backdrop-blur-md rounded-xl border border-[#1E293B]">
              <p className="text-xl">{result}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}


