import React, { useState } from 'react';
import { auth, provider } from '../../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiKey } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                await sendEmailVerification(userCredential.user);
                setShowOtpInput(true);
            } else {
                navigate('/');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        try {
            // Implement OTP verification logic here
            if (auth.currentUser.emailVerified) {
                navigate('/');
            } else {
                setError('Please verify your email first');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen -mt-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md p-8 mx-4"
            >
                <motion.div 
                    className="bg-dark-bg/80 backdrop-blur-xl border border-dark-border rounded-2xl shadow-2xl overflow-hidden"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <div className="p-8">
                        <h2 className="text-2xl font-medium text-white mb-6 text-center">Welcome Back</h2>
                        
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6"
                            >
                                {error}
                            </motion.div>
                        )}

                        {!showOtpInput ? (
                            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                                <motion.button
                                    type="submit"
                                    className="w-full bg-blue-500/80 hover:bg-blue-500 text-white p-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Login
                                </motion.button>
                            </form>
                        ) : (
                            <form onSubmit={handleOtpVerification} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiKey className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-dark-hover/50 border border-dark-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-white placeholder-gray-400 transition-all"
                                        required
                                    />
                                </div>
                                <motion.button
                                    type="submit"
                                    className="w-full bg-green-500/80 hover:bg-green-500 text-white p-3 rounded-xl transition-all duration-200 backdrop-blur-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Verify OTP
                                </motion.button>
                            </form>
                        )}

                        <div className="mt-6">
                            <motion.button
                                onClick={handleGoogleLogin}
                                className="w-full bg-dark-hover/50 hover:bg-dark-hover text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-dark-border"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaGoogle className="text-red-400" /> 
                                Continue with Google
                            </motion.button>
                        </div>

                        <p className="mt-6 text-center text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Register here
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>

    );
};

export default Login;