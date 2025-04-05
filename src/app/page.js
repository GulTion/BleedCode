"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { FaRocket, FaTrophy, FaBolt, FaGoogle, FaGithub, FaTimes, FaUserAstronaut } from 'react-icons/fa';
import { RiSpaceShipFill, RiAliensFill, RiGamepadFill } from 'react-icons/ri';
import { IoMdPlanet } from 'react-icons/io';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LandingPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setStars(newStars);
    };
    generateStars();
  }, []);

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        username: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      
      if (result.error) {
        // Handle error
        console.error(result.error);
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // For OAuth providers
  const handleGoogleLogin = () => signIn('google');
  const handleGithubLogin = () => signIn('github');

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Animated stars background */}
      <div className="fixed inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Cosmic gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-blue-900/30" />

      {/* Main content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <RiSpaceShipFill className="text-4xl text-purple-400" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                HectoClash
              </span>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center lg:text-left"
              >
                <TypeAnimation
                  sequence={[
                    'Welcome to HectoClash',
                    2000,
                    'Battle in Space',
                    2000,
                    'Become a Legend',
                    2000,
                  ]}
                  wrapper="h1"
                  speed={50}
                  repeat={Infinity}
                  className="text-5xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
                />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-300 text-center lg:text-left"
              >
                "Where cosmic warriors clash and stellar legends rise. Your destiny awaits among the stars!"
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
              >
                <button 
                  onClick={() => setShowLogin(true)}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <FaUserAstronaut className="text-lg" />
                  <span>Login</span>
                </button>
                <button className="px-8 py-3 bg-pink-600 hover:bg-pink-700 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center space-x-2">
                  <FaRocket className="text-lg" />
                  <span>Sign Up</span>
                </button>
                <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center space-x-2">
                  <RiGamepadFill className="text-lg" />
                  <span>Play as Guest</span>
                </button>
              </motion.div>

              <div className="flex items-center space-x-4 justify-center lg:justify-start">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                  onClick={handleGoogleLogin}
                >
                  <FaGoogle className="text-xl" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                  onClick={handleGithubLogin}
                >
                  <FaGithub className="text-xl" />
                </motion.button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="lg:w-1/2 mt-12 lg:mt-0 grid gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 transform hover:rotate-1 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <FaBolt className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Cosmic Combat Arena</h3>
                    <p className="text-gray-300">Challenge warriors across the galaxy in real-time battles</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 transform hover:rotate-1 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-pink-600 rounded-lg">
                    <RiAliensFill className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Stellar Power-Ups</h3>
                    <p className="text-gray-300">Harness the power of ancient cosmic artifacts</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 transform hover:rotate-1 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <FaTrophy className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Galactic Leagues</h3>
                    <p className="text-gray-300">Rise through the ranks to become a cosmic legend</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Floating Mascot */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="fixed bottom-10 right-10 hidden lg:block"
        >
          <div className="relative">
            <IoMdPlanet className="text-8xl text-purple-400 opacity-90" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <RiSpaceShipFill className="text-4xl text-white animate-pulse" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 p-8 rounded-2xl w-full max-w-md relative"
            >
              <button
                onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <FaTimes className="text-xl" />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back, Explorer!</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="cosmic.warrior@galaxy.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                  Launch Into Battle
                </button>

                <div className="text-center text-sm text-gray-400">
                  <a href="#" className="hover:text-purple-400">Forgot your cosmic credentials?</a>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .animate-twinkle {
          animation: twinkle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;