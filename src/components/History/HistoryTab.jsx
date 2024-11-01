import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useAuth } from '../../contexts/AuthContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiClock, FiActivity, FiPercent } from 'react-icons/fi';

const HistoryTab = () => {
    const { currentUser } = useAuth();
    const [history, setHistory] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        if (!currentUser) return;

        // Ensure the query is correctly set up
        const qHistory = query(
            collection(db, "history"),
            where("userId", "==", currentUser.uid),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(qHistory, (snapshot) => {
            setHistory(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            })));
        }, (error) => {
            console.error("Error fetching history:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleDeleteHistoryItem = async (id) => {
        if (window.confirm("Are you sure you want to delete this history item?")) {
            try {
                await deleteDoc(doc(db, "history", id));
                setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
            } catch (error) {
                console.error("Error deleting history item:", error);
            }
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm("Are you sure you want to clear all history?")) {
            try {
                const qHistory = query(
                    collection(db, "history"),
                    where("userId", "==", currentUser.uid)
                );
                const querySnapshot = await getDocs(qHistory);
                querySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
                setHistory([]);
            } catch (error) {
                console.error("Error clearing history:", error);
            }
        }
    };

    const filteredHistory = history.filter(record => {
        if (!record.timestamp) return false;
        return record.timestamp.toDateString() === selectedDate.toDateString();
    });

    return (
        <motion.div 
            className="container mx-auto p-4 select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        className="w-full"
                    />
                </motion.div>
                
                <motion.div 
                    className="space-y-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <FiClock className="text-purple-400" size={24} />
                        <h2 className="text-xl font-medium text-white">
                            Activities for {selectedDate.toDateString()}
                        </h2>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {filteredHistory.map(record => (
                            <motion.div 
                                key={record.id} 
                                className="p-4 rounded-xl bg-dark-hover/30 border border-dark-border backdrop-blur-sm"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-white">{record.text}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <FiActivity className="text-blue-400" />
                                            <span>{record.action}</span>
                                            <span className="text-gray-500">•</span>
                                            <FiPercent className="text-green-400" />
                                            <span>{record.progress}%</span>
                                        </div>
                                        
                                        {record.progressHistory?.map((progress, index) => (
                                            <div key={index} className="text-xs text-gray-500 flex items-center gap-2">
                                                <FiClock size={12} />
                                                {progress.timestamp?.toDate && (
                                                    `${formatTime(new Date(progress.timestamp))}: ${progress.progress}%`
                                                )}
                                            </div>
                                        ))}
                                        
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            <FiClock size={12} />
                                            {formatTime(record.timestamp)}
                                        </p>
                                    </div>
                                    
                                    <motion.button 
                                        onClick={() => handleDeleteHistoryItem(record.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <FiTrash2 />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
            
            <motion.button 
                onClick={handleClearHistory}
                className="fixed bottom-4 right-4 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <FiTrash2 />
                <span>Clear History</span>
            </motion.button>
        </motion.div>

    );
};

export default HistoryTab;