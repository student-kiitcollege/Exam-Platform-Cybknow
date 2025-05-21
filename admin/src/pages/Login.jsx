import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const [tempUser, setTempUser] = useState(null);
  const [tempToken, setTempToken] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and Password are required');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.role !== 'student') {
        setError('Access denied. Only students can log in here.');
        return;
      }

      setTempUser({ email: data.email, role: data.role });
      setTempToken(data.token);
      setShowModal(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAgree = () => {
    if (tempUser && tempToken) {
      login(tempUser, tempToken);
    }
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
            <h1 className="text-2xl mb-4 text-center">Student Login</h1>
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
                  className="absolute right-2 top-9 text-gray-400 hover:text-white focus:outline-none"
                >
                  {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
              >
                Login
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="mx-4 text-gray-400 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/teacher-login')}
              className="w-full py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-semibold rounded-lg shadow-lg hover:opacity-90 transition-all duration-300 ease-in-out cursor-pointer"
            >
              👨‍🏫 Teacher Login
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">Before You Begin the Exam</h2>
            <div className="text-left mb-4">
              <h3 className="font-bold text-green-700 mb-2">✅ Do:</h3>
              <ul className="list-disc list-inside mb-4 text-sm">
                <li>Ensure a stable internet connection</li>
                <li>Sit in a well-lit room</li>
                <li>Keep your camera and microphone enabled</li>
                <li>Maintain academic integrity throughout the exam</li>
              </ul>
              <h3 className="font-bold text-red-700 mb-2">❌ Don't:</h3>
              <ul className="list-disc list-inside text-sm">
                <li>Use mobile phones or unauthorized devices</li>
                <li>Switch tabs or open new windows</li>
                <li>Communicate with others during the exam</li>
                <li>Attempt to cheat or impersonate someone</li>
              </ul>
            </div>
            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={handleAgree}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full hover:cursor-pointer"
              >
                I Agree
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full hover:cursor-pointer"
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
