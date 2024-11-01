// src/components/Todo/AddTodo.jsx:path/to/file
import React, { useState } from 'react';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiPlus } from 'react-icons/fi';

const AddTodo = () => {
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const { currentUser } = useAuth();

    const handleAdd = async (e) => {
        e.preventDefault();
        if(text.trim() === "") return;

        await addDoc(collection(db, "todos"), {
            text,
            completed: false,
            progress: 0,
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        setText('');
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
        >
            <motion.form 
                onSubmit={handleAdd} 
                className={`flex w-full bg-dark-hover rounded-xl overflow-hidden border ${
                    isFocused ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-dark-border'
                } transition-all duration-300`}
            >
                <input 
                    type="text" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                />
                <div className="px-3 flex items-center">
                    <motion.button 
                        type="submit" 
                        className={`p-2 rounded-lg focus:outline-none transition-all duration-300 ${
                            text.trim() 
                                ? 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30' 
                                : 'bg-dark-active border border-dark-border'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!text.trim()}
                        aria-label="Add task"
                    >
                        <motion.div
                            animate={{ 
                                rotate: text.trim() ? 0 : 45,
                                scale: text.trim() ? 1 : 0.9,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            <FiPlus 
                                size={18} 
                                className={`transition-colors duration-300 ${
                                    text.trim() ? 'text-blue-400' : 'text-gray-400'
                                }`}
                                strokeWidth={2.5}
                            />
                        </motion.div>
                    </motion.button>
                </div>
            </motion.form>
        </motion.div>
    );
}

export default AddTodo;