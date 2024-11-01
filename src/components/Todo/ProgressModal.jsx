// src/components/Todo/ProgressModal.jsx:path/to/file
import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { doc, updateDoc, getDoc, addDoc, collection } from "firebase/firestore";
import { motion } from 'framer-motion';
import { FaTimes, FaCheck } from 'react-icons/fa';

const ProgressModal = ({ todo, onClose }) => {
    const [progress, setProgress] = useState(todo.progress);

    const handleProgressChange = (e) => {
        const value = Math.max(todo.progress, Math.min(100, Number(e.target.value)));
        setProgress(value);
    };

    const handleUpdateProgress = async () => {
        try {
            const todoRef = doc(db, "todos", todo.id);
            const todoDoc = await getDoc(todoRef);
            const currentTodo = todoDoc.data();

            const progressHistory = currentTodo.progressHistory || [];
            const currentTime = new Date();

            const updatedHistory = [...progressHistory, {
                timestamp: currentTime.toISOString(),
                progress: progress
            }];

            await updateDoc(todoRef, {
                progress: progress,
                progressHistory: updatedHistory,
                updatedAt: currentTime
            });

            await addDoc(collection(db, "history"), {
                text: todo.text,
                action: "Progress Updated",
                progress: progress,
                timestamp: currentTime,
                userId: todo.userId,
                createdAt: todo.createdAt,
                progressHistory: updatedHistory
            });

            if (progress === 100) {
                await updateDoc(todoRef, {
                    completed: true
                });
            }

            onClose();

        } catch (error) {
            console.error("Error updating progress:", error);
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div 
                className="bg-white/90 dark:bg-gray-800/90 p-8 rounded-2xl shadow-2xl w-96 border border-gray-200 dark:border-gray-700"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Update Progress</h3>
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose} 
                        className="text-gray-500 hover:text-red-500 transition-all duration-200"
                    >
                        <FaTimes className="w-5 h-5" />
                    </motion.button>
                </div>
                
                <div className="mb-8">
                    <div className="flex justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Progress: {progress}%
                        </span>
                    </div>
                    <input 
                        type="range" 
                        value={progress}
                        onChange={handleProgressChange}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                                 accent-blue-500 hover:accent-blue-600 transition-all duration-200"
                        min={todo.progress}
                        max="100"
                        step="1"
                    />
                </div>

                <div className="flex justify-end">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUpdateProgress} 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl
                                 transition-all duration-200 flex items-center gap-2 font-medium
                                 shadow-lg shadow-blue-500/30"
                    >
                        <FaCheck className="w-4 h-4" /> Update
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProgressModal;