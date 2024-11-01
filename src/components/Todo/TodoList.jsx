// src/components/Todo/TodoList.jsx:path/to/file
import React, { useEffect, useState } from 'react';
import AddTodo from './AddTodo';
import TodoItem from './TodoItem';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiClock } from 'react-icons/fi';

const TodoList = () => {
    const { currentUser } = useAuth();
    const [ongoing, setOngoing] = useState([]);
    const [completed, setCompleted] = useState([]);

    useEffect(() => {
        const qOngoing = query(
            collection(db, "todos"),
            where("userId", "==", currentUser.uid),
            where("completed", "==", false)
        );

        const qCompleted = query(
            collection(db, "todos"),
            where("userId", "==", currentUser.uid),
            where("completed", "==", true)
        );

        const unsubscribeOngoing = onSnapshot(qOngoing, (snapshot) => {
            setOngoing(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubscribeCompleted = onSnapshot(qCompleted, (snapshot) => {
            setCompleted(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubscribeOngoing();
            unsubscribeCompleted();
        };
    }, [currentUser]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.3,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            className="mx-auto select-none"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div 
                className="rounded-2xl bg-dark-bg border border-dark-border p-3 sm:p-6 mb-4 sm:mb-8 backdrop-blur-lg"
                variants={itemVariants}
            >
                <AddTodo />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    <motion.div 
                        className="rounded-xl bg-dark-hover/30 p-3 sm:p-6 backdrop-blur-sm border border-dark-border"
                        variants={itemVariants}
                    >
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <FiClock className="text-blue-400" size={20} />
                            <h2 className="text-lg sm:text-xl font-medium text-white">Ongoing Tasks</h2>
                            <span className="text-xs sm:text-sm text-gray-400 ml-auto">
                                {ongoing.length} tasks
                            </span>
                        </div>
                        
                        <motion.div 
                            className="min-h-[200px] space-y-2"
                            variants={itemVariants}
                        >
                            <AnimatePresence mode="popLayout">
                                {ongoing.map((todo) => (
                                    <motion.div
                                        key={todo.id}
                                        layout
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <TodoItem todo={todo} />
                                    </motion.div>
                                ))}
                                {ongoing.length === 0 && (
                                    <motion.div 
                                        className="text-gray-400 text-center py-8"
                                        variants={itemVariants}
                                    >
                                        No ongoing tasks
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>

                  
                <motion.div 
                    className="rounded-xl bg-dark-hover/30 p-3 sm:p-6 backdrop-blur-sm border border-dark-border"
                    variants={itemVariants}
                >
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <FiCheckCircle className="text-green-400" size={20} />
                        <h2 className="text-lg sm:text-xl font-medium text-white">Completed Tasks</h2>
                        <span className="text-xs sm:text-sm text-gray-400 ml-auto">
                            {completed.length} tasks
                        </span>
                    </div>
                    
                    <motion.div 
                        className="min-h-[200px] space-y-2"
                        variants={itemVariants}
                    >
                            <AnimatePresence mode="popLayout">
                                {completed.map((todo) => (
                                    <motion.div
                                        key={todo.id}
                                        layout
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <TodoItem todo={todo} />
                                    </motion.div>
                                ))}
                                {completed.length === 0 && (
                                    <motion.div 
                                        className="text-gray-400 text-center py-8"
                                        variants={itemVariants}
                                    >
                                        No completed tasks
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TodoList;