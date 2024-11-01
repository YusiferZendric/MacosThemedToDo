import React, { useState } from 'react';
import { FiCheck, FiRotateCcw, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/config';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import ProgressModal from './ProgressModal';

const TodoItem = ({ todo }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(todo.text);
    const [isProgressOpen, setIsProgressOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const toggleComplete = async () => {
        const todoRef = doc(db, "todos", todo.id);
        const newCompletedStatus = !todo.completed;

        await updateDoc(todoRef, {
            completed: newCompletedStatus,
            progress: newCompletedStatus ? 100 : todo.progress
        });

        if (newCompletedStatus) {
            await addDoc(collection(db, "history"), {
                text: todo.text,
                action: "Completed",
                progress: 100,
                timestamp: serverTimestamp(),
                userId: todo.userId,
                createdAt: todo.createdAt,
                progressHistory: todo.progressHistory || []
            });
        }
    }

    const handleDelete = async () => {
        if (todo.progress > 0) {
            await addDoc(collection(db, "history"), {
                text: todo.text,
                action: "Deleted",
                progress: todo.progress,
                timestamp: serverTimestamp(),
                userId: todo.userId,
                createdAt: todo.createdAt,
                progressHistory: todo.progressHistory || []
            });
        }
        await deleteDoc(doc(db, "todos", todo.id));
    }

    const handleEdit = async () => {
        if (newText.trim() === "") return;
        const todoRef = doc(db, "todos", todo.id);
        await updateDoc(todoRef, {
            text: newText.trim()
        });
        setIsEditing(false);
    }

    return (
        <>
        <motion.div 
            className={`relative p-4 rounded-xl mb-3 backdrop-blur-sm border transition-all duration-300 ${
                isHovered ? 'bg-dark-hover/50' : 'bg-dark-hover/30'
            } ${
                todo.completed ? 'border-green-500/20' : 'border-dark-border'
            }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <div className="flex items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-3 flex-1">
                    <motion.button 
                        onClick={toggleComplete}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg transition-colors ${
                            todo.completed 
                                ? 'text-green-400 hover:bg-green-500/20' 
                                : 'text-blue-400 hover:bg-blue-500/20 hover:text-blue-300'
                        }`}
                    >
                        {todo.completed ? (
                            <FiRotateCcw size={18} />
                        ) : (
                            <motion.div
                                whileHover={{ y: -1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <FiCheck 
                                    size={18} 
                                    className="drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]" 
                                />
                            </motion.div>
                        )}
                    </motion.button>
                        
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                onBlur={handleEdit}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleEdit();
                                    if(e.key === 'Escape') setIsEditing(false);
                                }}
                                className="flex-1 bg-dark-active px-3 py-1.5 rounded-lg border border-dark-border focus:border-blue-500/50 focus:outline-none text-white"
                                autoFocus
                            />
                        ) : (
                            <span 
                                className={`flex-1 cursor-pointer ${
                                    todo.completed ? 'line-through text-gray-500' : 'text-white'
                                }`}
                                onClick={() => setIsEditing(true)}
                            >
                                {todo.text}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${todo.completed ? 'text-green-400' : 'text-blue-400'}`}>
                            {todo.completed ? 100 : todo.progress}%
                        </span>
                        
                        <motion.button 
                            onClick={() => setIsProgressOpen(true)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                            <FiPlus size={18} />
                        </motion.button>
                        
                        <motion.button 
                            onClick={handleDelete}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <FiTrash2 size={18} />
                        </motion.button>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-dark-active rounded-b-xl overflow-hidden">
                    <motion.div 
                        className={`h-full ${todo.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${todo.completed ? 100 : todo.progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </motion.div>
            
            <AnimatePresence>
                {isProgressOpen && (
                    <ProgressModal todo={todo} onClose={() => setIsProgressOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}

export default TodoItem;