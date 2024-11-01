import React, { useState, useEffect } from 'react';
import { auth, provider, db } from '../../firebase/config';

import { 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    sendEmailVerification,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiCheck } from 'react-icons/fi';
const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const navigate = useNavigate();

    // Extract username from email when email changes
    useEffect(() => {
        if (email && !username) {
            const extractedUsername = email.split('@')[0];
            setUsername(extractedUsername);
        }
    }, [email]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                user.reload().then(() => {
                    if (user.emailVerified) {
                        setIsVerified(true);
                        setTimeout(() => {
                            navigate('/');
                        }, 2000);
                    }
                });
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        if (username.length < 3) {
            setError("Username must be at least 3 characters long!");
            return;
        }

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile with username
            await updateProfile(user, {
                displayName: username
            });

            // Store additional user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                createdAt: new Date(),
                lastLogin: new Date()
            });

            // Send verification email
            await sendEmailVerification(user);
            setVerificationSent(true);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('This email is already registered.');
            } else {
                setError(error.message);
            }
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: user.displayName || user.email.split('@')[0],
                email: user.email,
                createdAt: new Date(),
                lastLogin: new Date()
            });

            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    const renderMessage = () => {
        if (isVerified) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                >
                    <FiCheck className="text-green-400" />
                    Email verified successfully! Redirecting...
                </motion.div>
            );
        }
        if (verificationSent) {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl mb-4"
                >
                    Verification email sent! Please check your inbox.
                </motion.div>
            );
        }
        return null;
    };

    return (
        <div className="flex items-center justify-center min-h-screen -mt-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md p-4"
            >
                <motion.div 
                    className="bg-dark-bg/80 backdrop-blur-xl border border-dark-border rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="p-6">
                        <h2 className="text-2xl font-medium text-white mb-4 text-center">Create Account</h2>
                        
                        {renderMessage()}
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4"
                            >
                                {error}
                            </motion.div>
                        )}

                        {!verificationSent && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiMail className="text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-dark-hover/50 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 transition-all"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 pb-4 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-dark-hover/50 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 transition-all"
                                        required
                                        minLength={3}
                                    />
                                    <p className="text-xs text-gray-500 mt-1 ml-1">
                                        Auto-generated from email if left empty
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-dark-hover/50 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 transition-all"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-dark-hover/50 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 transition-all"
                                        required
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    className="w-full bg-blue-500/80 hover:bg-blue-500 text-white p-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Register
                                </motion.button>
                            </form>
                        )}

                        {!verificationSent && (
                            <>
                                <div className="mt-4">
                                    <motion.button
                                        onClick={handleGoogleRegister}
                                        className="w-full bg-dark-hover/50 hover:bg-dark-hover text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-dark-border"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FaGoogle className="text-red-400" />
                                        Continue with Google
                                    </motion.button>
                                </div>

                                <p className="mt-6 text-center text-gray-400">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                                        Login here
                                    </Link>
                                </p>
                            </>
                        )}

                        {verificationSent && (
                            <motion.button
                                onClick={() => window.location.reload()}
                                className="w-full mt-4 bg-green-500/80 hover:bg-green-500 text-white p-3 rounded-xl transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FiCheck />
                                I've verified my email
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;