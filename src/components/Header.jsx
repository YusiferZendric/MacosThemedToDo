// src/components/Header.jsx:path/to/file
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import ResetInterface from './ResetInterface';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import {
    FiMenu,
    FiX,
    FiHome,
    FiRefreshCw,
    FiClock,
    FiLogOut,
    FiMoon,
    FiSun,
    FiSunrise
} from 'react-icons/fi';

const Header = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getTimeInfo = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { time: 'morning', icon: <FiSunrise className="text-amber-400" size={20} /> };
        if (hour < 17) return { time: 'afternoon', icon: <FiSun className="text-amber-400" size={20} /> };
        return { time: 'evening', icon: <FiMoon className="text-blue-400" size={20} /> };
    };

    const getFirstName = () => {
        if (currentUser?.displayName) {
            return currentUser.displayName.split(' ')[0];
        }
        return currentUser?.email?.split('@')[0] || 'User';
    };

    const timeInfo = getTimeInfo();
    const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
        setIsMenuOpen(false);
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const handleNewInterface = async () => {
        if (!window.confirm("Are you sure you want to clear all tasks? This action cannot be undone.")) {
            return;
        }

        try {
            // Get all ongoing tasks
            const ongoingQuery = query(
                collection(db, "todos"),
                where("userId", "==", currentUser.uid),
                where("completed", "==", false)
            );
            const ongoingSnapshot = await getDocs(ongoingQuery);

            // Get all completed tasks
            const completedQuery = query(
                collection(db, "todos"),
                where("userId", "==", currentUser.uid),
                where("completed", "==", true)
            );
            const completedSnapshot = await getDocs(completedQuery);

            // Add to history before deletion
            const batch = [];

            // Process ongoing tasks
            ongoingSnapshot.forEach(doc => {
                const todo = doc.data();
                batch.push(
                    addDoc(collection(db, "history"), {
                        text: todo.text,
                        action: "Cleared",
                        progress: todo.progress,
                        timestamp: serverTimestamp(),
                        userId: currentUser.uid,
                        createdAt: todo.createdAt,
                        progressHistory: todo.progressHistory || []
                    })
                );
            });

            // Process completed tasks
            completedSnapshot.forEach(doc => {
                const todo = doc.data();
                batch.push(
                    addDoc(collection(db, "history"), {
                        text: todo.text,
                        action: "Cleared",
                        progress: todo.progress,
                        timestamp: serverTimestamp(),
                        userId: currentUser.uid,
                        createdAt: todo.createdAt,
                        progressHistory: todo.progressHistory || []
                    })
                );
            });

            // Add all items to history
            await Promise.all(batch);

            // Delete all tasks
            const deletePromises = [];
            ongoingSnapshot.forEach(doc => {
                deletePromises.push(deleteDoc(doc.ref));
            });
            completedSnapshot.forEach(doc => {
                deletePromises.push(deleteDoc(doc.ref));
            });

            await Promise.all(deletePromises);

            // Optional: Show success message
            alert("All tasks have been cleared successfully!");
        } catch (error) {
            console.error("Error clearing interface:", error);
            alert("Failed to clear tasks. Please try again.");
        }
    };


    return (
        <>
            <header className="bg-dark-bg/95 backdrop-blur-md border-b border-dark-border text-white p-4 flex justify-between items-center fixed top-0 w-full z-50 select-none">
                <div className="flex items-center gap-4">
                    {currentUser && (
                        <>
                            <Link to="/" className="hidden lg:block">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 hover:bg-dark-hover rounded-lg transition-colors text-blue-400"
                                >
                                    <FiHome size={20} />
                                </motion.button>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleMenu}
                                className="lg:hidden p-2 hover:bg-dark-hover rounded-lg transition-colors"
                                aria-label="Toggle menu"
                            >
                                <FiMenu className="text-xl" />
                            </motion.button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-dark-hover rounded-lg">
                                    {timeInfo.icon}
                                </div>
                                <div>
                                    <h1 className="text-lg font-medium text-white">
                                        Good {timeInfo.time}, {getFirstName()}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <span>{currentTime} • Let's be productive today</span>
                                        <span className="text-gray-500 hidden lg:inline">•</span>
                                        <span className="hidden lg:inline">
                                            {new Date().toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-4">
                    {currentUser && (
                        <>
                            <motion.button
                                onClick={handleNewInterface}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 rounded-lg bg-dark-hover hover:bg-dark-active transition-colors flex items-center gap-2"
                            >
                                <FiRefreshCw className="text-blue-400" />
                                <span>New Interface</span>
                            </motion.button>

                            <Link
                                to="/history"
                                className="px-4 py-2 rounded-lg hover:bg-dark-hover transition-colors flex items-center gap-2"
                            >
                                <FiClock className="text-purple-400" />
                                <span>History</span>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                            >
                                <FiLogOut />
                                <span>Logout</span>
                            </motion.button>
                        </>
                    )}
                </nav>
            </header>


            {/* Mobile Sidebar */}
            <AnimatePresence>
                {currentUser && isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 h-full w-72 bg-dark-bg border-r border-dark-border z-50"
                        >
                            <div className="flex justify-between items-center p-4 border-b border-dark-border">
                                <h2 className="text-white text-xl font-medium">Menu</h2>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleMenu}
                                    className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
                                >
                                    <FiX className="text-xl" />
                                </motion.button>
                            </div>
                            <nav className="flex flex-col p-4 gap-2">
                                <Link
                                    to="/"
                                    className="flex items-center gap-3 text-white py-2 px-3 hover:bg-dark-hover rounded-lg transition-colors"
                                    onClick={toggleMenu}
                                >
                                    <FiHome className="text-blue-400" />
                                    <span>Home</span>
                                </Link>
                                <button
                                    className="flex items-center gap-3 text-white py-2 px-3 hover:bg-dark-hover rounded-lg transition-colors"
                                    onClick={() => {
                                        handleNewInterface();
                                        toggleMenu();
                                    }}
                                >
                                    <FiRefreshCw className="text-green-400" />
                                    <span>New Interface</span>
                                </button>

                                <Link
                                    to="/history"
                                    className="flex items-center gap-3 text-white py-2 px-3 hover:bg-dark-hover rounded-lg transition-colors"
                                    onClick={toggleMenu}
                                >
                                    <FiClock className="text-purple-400" />
                                    <span>History</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 text-red-400 py-2 px-3 hover:bg-dark-hover rounded-lg transition-colors mt-2"
                                >
                                    <FiLogOut />
                                    <span>Logout</span>
                                </button>
                            </nav>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                            onClick={toggleMenu}
                        />
                    </>
                )}
            </AnimatePresence>

            <div className="h-16"></div>
        </>
    );
}

export default Header;