import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const validUsers = [
        { email: 'student@cybknow.com', password: 'Cybknow123', role: 'student' },
        { email: 'jenasourav2001@gmail.com', password: 'Jaga@1234', role: 'student' },
        { email: 'jane@example.com', password: 'JaneSecure456', role: 'student' },
    ];

    const handleLogin = (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email and Password are required');
            return;
        }

        const user = validUsers.find((u) => u.email === email && u.password === password);

        if (!user) {
            setError('Invalid email or password');
            return;
        }

        try {
            setUser({ email: user.email, role: user.role });
            setShowModal(true);
            setError('');
        } catch (err) {
            setError('Failed to log in. Please try again.');
        }
    };

    const handleStartExam = () => {
        setShowModal(false);
        navigate('/dashboard');
    };

    const handleCancel = () => {
        setShowModal(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">
            <div className="flex flex-1">
                <div className="w-1/2 flex items-center justify-center p-8 bg-gray-900">
                    <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm text-center">
                        <img
                            src="https://cybknow.com/wp-content/uploads/2025/02/logo.png"
                            alt="Login Visual"
                            className="w-full mb-4 rounded"
                        />
                        <p className="text-lg text-gray-300">
                            Welcome to <span className="font-semibold">CybknowExam</span> – Your trusted online exam platform. Login to begin!
                        </p>
                    </div>
                </div>

                <div className="w-1/2 flex items-center justify-center p-8">
                    <div className="bg-gray-800 p-6 rounded shadow-md w-full max-w-sm">
                        <h1 className="text-2xl mb-4 text-center">Login</h1>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4 relative">
                                <label htmlFor="password" className="block text-sm mb-2">Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="w-full p-2 rounded bg-gray-700 text-white pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-9 text-gray-400 hover:text-white focus:outline-none hover:cursor-pointer"
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                            >
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white text-black p-6 rounded-lg shadow-md w-80 text-center">
                        <h2 className="text-xl font-semibold mb-4">Ready to Start the Exam?</h2>
                        <div className="flex justify-between gap-4">
                            <button
                                onClick={handleStartExam}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full cursor-pointer"
                            >
                                Start Exam
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded w-full cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
