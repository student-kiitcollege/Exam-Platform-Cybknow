import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from '../Component/NavbarComponent';
import Footer from '../Component/Footer';
import { FaUserAlt } from "react-icons/fa"; 
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState('');
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  useEffect(() => {
    const handlePopState = () => {
      navigate('/dashboard', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionGranted(true);
      setMediaStream(stream);
      setError('');
    } catch (err) {
      console.error('Permission error:', err);
      setPermissionGranted(false);
      setError('Camera and microphone permission are required to start the exam.');
    }
  };

  const handleStartExam = () => {
    if (!permissionGranted) {
      setError('Please allow camera and microphone access to start the exam.');
      return;
    }

    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) {
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }

    navigate('/exam/123');  
  };

  const handleLogout = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setUser(null); 
    navigate('/', { replace: true });
  };

  const examInfo = {
    timeLeft: "60s",
    totalQuestions: 9,
    totalMarks: 9,
    negativeMarking: "Yes (1 mark per 3 wrong answer)"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavbarComponent />

      <main className="flex-grow p-4 bg-gray-100">
        <nav className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-md mb-6 shadow">
          <div className="flex items-center space-x-6">
            <span className="text-lg font-semibold">Total Time: {examInfo.timeLeft}</span>
            <span className="text-lg font-semibold">Total Questions: {examInfo.totalQuestions}</span>
          </div>
          <div className="flex items-center space-x-4">
            <FaUserAlt className="text-xl" />
            <span className="text-lg font-semibold">{user?.email || 'User'}</span>
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
            >
              Logout
            </button>
          </div>
        </nav>

        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>
        )}

        <section className="bg-white shadow-md rounded-md p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Ready To Start</h1>
            <ul className="text-lg text-gray-700 mb-6 space-y-2">
              <li><strong>Total Questions:</strong> {examInfo.totalQuestions}</li>
              <li><strong>Total Marks:</strong> {examInfo.totalMarks}</li>
              <li><strong>Negative Marking:</strong> {examInfo.negativeMarking}</li>
            </ul>

            {!permissionGranted ? (
              <button
                onClick={requestPermissions}
                className="font-semibold px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Allow Camera & Microphone
              </button>
            ) : (
              <button
                onClick={handleStartExam}
                className="font-semibold px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              >
                Start Exam
              </button>
            )}
          </div>

          {permissionGranted && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-32 h-32 border-2 border-green-500"
              style={{ objectFit: 'cover', borderRadius: 0, transform: 'scaleX(-1)' }} // flipped video preview
            />
          )}
        </section>

        <section className="bg-white shadow-md rounded-md p-6 text-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Terms and Conditions</h2>
          <ul className="list-disc pl-6 space-y-2 text-base">
            <li>Camera and microphone access are required to start the exam.</li>
            <li>Once the exam starts, the timer will not stop or pause under any circumstances.</li>
            <li>Do not reload or leave the page during the exam — it may result in disqualification.</li>
            <li>Each correct answer gives 1 mark.</li>
            <li>Every 3 wrong answers will deduct 1 mark (Negative Marking).</li>
            <li>Short answer questions are manually evaluated and may take additional time to grade.</li>
            <li>Any attempt to cheat or use unfair means will lead to immediate cancellation of the exam.</li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
