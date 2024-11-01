// src/components/ResetInterface.jsx:path/to/file
import React from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '../contexts/AuthContext';

const ResetInterface = () => {
    const { currentUser } = useAuth();

    const handleReset = async () => {
        try {
            // Get all todos
            const todosRef = collection(db, "todos");
            const q = query(todosRef, where("userId", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);

            // Process each todo
            for (const doc of querySnapshot.docs) {
                const todo = doc.data();

                // Save completed or progress > 0 todos to history
                if (todo.completed || todo.progress > 0) {
                    await addDoc(collection(db, "history"), {
                        text: todo.text,
                        action: todo.completed ? "Completed" : "Reset",
                        progress: todo.progress,
                        timestamp: serverTimestamp(),
                        userId: currentUser.uid,
                        createdAt: todo.createdAt,
                        progressHistory: todo.progressHistory || []
                    });
                }

                // Delete the todo
                await deleteDoc(doc.ref);
            }
        } catch (error) {
            console.error("Error resetting interface:", error);
        }
    };

    return (
        <button
            onClick={handleReset}
            className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors text-sm"
        >
            New Interface
        </button>
    );
};

export default ResetInterface;