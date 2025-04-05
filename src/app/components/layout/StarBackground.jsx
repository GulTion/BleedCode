// components/layout/StarBackground.jsx
"use client";
import { useState, useEffect } from 'react';

const StarBackground = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 0.2 + 0.1,
        opacity: Math.random() * 0.7 + 0.1 // Slightly less bright
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  return (
    <>
      {/* Stars background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}rem`,
              height: `${star.size}rem`,
              opacity: star.opacity,
              animation: `twinkle ${Math.random() * 5 + 4}s infinite ease-in-out alternate` // Added alternate
            }}
          />
        ))}
      </div>
       {/* Cosmic gradient overlay */}
       <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-blue-900/40 z-0 pointer-events-none"></div>

       {/* CSS for star animation */}
       <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.1; transform: scale(0.8); }
          100% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </>
  );
};

export default StarBackground;