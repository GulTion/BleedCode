// src/components/UserListSidebar.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './sidebar.css'; // Ensure this CSS file is created

function UserListSidebar({ users = [], isPlayer, canStartGame, onStartGame }) {

    const renderUserDetails = (user) => {
        if (user.role === 'player') {
            return `Player: ${user.playerId || 'Joining...'}`;
        } else if (user.role === 'spectator') {
            return `Spectator (Watching ${user.targetPlayerId || '...'})`;
        }
        return 'Connecting...';
    };

    return (
        <aside className="user-list-sidebar">
            <h2 className="sidebar-title">Connected Users ({users.length})</h2>
            <ul className="user-list">
                <AnimatePresence>
                    {users.map((user) => (
                        <motion.li
                            key={user.uniqueId}
                            className={`user-item ${user.role}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                            layout
                        >
                            <span className={`role-icon ${user.role === 'player' ? 'player-icon' : 'spectator-icon'}`}>
                                {user.role === 'player' ? '🎮' : '👁️'}
                            </span>
                            <span className="user-details">
                                {renderUserDetails(user)}
                            </span>
                        </motion.li>
                    ))}
                </AnimatePresence>
                {users.length === 0 && (
                    <p className="no-users-message">No users in this room yet.</p>
                )}
            </ul>

            {/* Start Game Button - Conditionally Rendered */}
            {isPlayer && (
                <div className="start-button-container">
                    <motion.button
                        className="start-game-button"
                        onClick={onStartGame}
                        disabled={!canStartGame}
                        whileHover={canStartGame ? { scale: 1.05, boxShadow: "0 0 15px rgba(138, 91, 246, 0.4)" } : {}}
                        whileTap={canStartGame ? { scale: 0.95 } : {}}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }} // Slight delay for appearance
                    >
                        {canStartGame ? 'Start Game' : (users.length < 2 ? 'Waiting for Players...' : 'Game Started')}
                    </motion.button>
                     {!canStartGame && users.length < 2 && (
                         <p className="start-condition-message">Need at least 2 users</p>
                     )}
                </div>
            )}
        </aside>
    );
}

export default UserListSidebar;