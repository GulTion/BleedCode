"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, PerspectiveCamera } from "@react-three/drei";
import "@/app/globals.css";

// 3D Planet Component
function Planet(props) {
  const mesh = useRef();
  useFrame(() => (mesh.current.rotation.y += 0.002));
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh} {...props}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#4D9DE0"
          metalness={0.7}
          roughness={0.5}
          emissive="#1a237e"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Meteor Component
function Meteors() {
  const group = useRef();
  useEffect(() => {
    const createMeteor = () => {
      const meteor = document.createElement("div");
      meteor.className = "meteor";
      meteor.style.cssText = `
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 30 + 15}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation-duration: ${Math.random() * 3 + 2}s;
      `;
      group.current.appendChild(meteor);
      setTimeout(() => {
        meteor.remove();
        createMeteor();
      }, parseFloat(meteor.style.animationDuration) * 1000);
    };
    for (let i = 0; i < 20; i++) createMeteor();
  }, []);
  return <div ref={group} className="meteors-container" />;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0E18] to-[#1A1B41] text-white relative overflow-x-hidden">
      <Meteors />
      <div className="absolute inset-0 pointer-events-none">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        </Canvas>
      </div>

      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          ProblemSolveX
        </div>
        <ul className="hidden md:flex gap-8">
          {['Home', 'Problems', 'Leaderboard', 'Events'].map((item) => (
            <li key={item}>
              <a href={`#${item.toLowerCase()}`} className="hover:text-purple-500 transition-colors">
                {item}
              </a>
            </li>
          ))}
          <li>
            <a href="#login" className="bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              Login/Register
            </a>
          </li>
        </ul>
      </nav>

      <main className="p-6 md:p-8 relative z-10">
        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col md:flex-row items-center justify-between py-12">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Solve. Compete.{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Conquer.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg md:text-xl opacity-80 mb-8 leading-relaxed"
            >
              Join the ultimate problem-solving battleground where coding meets creativity.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-blue-500 px-8 py-4 rounded-full text-lg font-medium shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all"
            >
              Start Coding Journey
            </motion.button>
          </div>
          <div className="w-full md:w-[400px] h-[400px] mt-12 md:mt-0">
            <Canvas>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Planet position={[0, 0, -2]} />
            </Canvas>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20" id="problems">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Explore Our Universe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🚀", title: "Challenge Arena", desc: "1000+ problems across various difficulty levels" },
              { icon: "⏱️", title: "Real-time Competitions", desc: "Weekly contests with global rankings" },
              { icon: "📈", title: "Skill Development", desc: "Personalized learning paths" }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center hover:-translate-y-2 transition-transform"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="opacity-80 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20" id="leaderboard">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Live Universe Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">
              <h3 className="text-lg opacity-80 mb-4">Active Participants</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                12,345
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">
              <h3 className="text-lg opacity-80 mb-4">Problems Solved</h3>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                67,890
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
              <h3 className="text-lg opacity-80 mb-4 text-center">Top Performers</h3>
              <div className="space-y-4">
                {["CodeMaster", "AlgoQueen", "ByteWizard"].map((name, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-20" id="events">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Upcoming Missions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { date: "MAY 15", title: "Algorithm Galaxy Challenge", desc: "Monthly algorithmic competition" },
              { date: "JUN 02", title: "Code Wars: Data Structures", desc: "Data structures themed contest" }
            ].map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8"
              >
                <div className="inline-block px-4 py-2 rounded-full bg-purple-900/30 text-sm font-semibold mb-4">
                  {event.date}
                </div>
                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                <p className="opacity-80 mb-6">{event.desc}</p>
                <button className="border border-purple-600 text-purple-500 px-6 py-2 rounded-full hover:bg-purple-600/10 transition-colors">
                  Register
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/30 backdrop-blur-md py-16 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
                ProblemSolveX
              </div>
            </div>
            {[
              { title: "Platform", links: ["Problems", "Contests", "Leaderboard"] },
              { title: "Community", links: ["Forum", "Blog", "Discord"] },
              { title: "Company", links: ["About", "Careers", "Contact"] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-lg font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="opacity-70 hover:opacity-100 transition-opacity">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/10 text-center opacity-60 text-sm">
            © 2025 ProblemSolveX. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
