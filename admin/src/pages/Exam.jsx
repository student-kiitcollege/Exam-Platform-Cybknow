import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Failed to get media stream on exam start:', err);
        alert('Camera and microphone permission are required to take the exam.');
        navigate('/', { replace: true });
      }
    };
    getMediaStream();
  }, [navigate]);

  useEffect(() => {
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/questions/getquestions`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      fetchQuestions();
    } else {
      setError('Invalid exam ID.');
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (loading || error) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, error]);

  useEffect(() => {
    if (isTimeUp) {
      handleSubmit();
    }
  }, [isTimeUp]);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        console.log('Camera and microphone stopped on unmount.');
      }
    };
  }, [mediaStream]);

  const handleChange = (id, value) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [id]: value }));
  };

  const handleSubmit = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      console.log('Camera and microphone stopped on submit.');
    }
    alert('Your exam has been submitted.');
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Loading questions...</div>;
  }

  if (error) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Error: {error}</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen relative">
      <h1 className="text-2xl mb-4 font-bold">Exam ID: {examId}</h1>
      <p className="mb-4 text-lg">
        Time Left: <span className="font-semibold">{timeLeft}s</span>
      </p>

      <div
        className="fixed top-4 right-4 w-24 h-24 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg"
        style={{ zIndex: 1000 }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <ol className="list-decimal list-inside space-y-6">
        {questions.length > 0 ? (
          questions.map((q) => (
            <li key={q._id} className="bg-gray-800 p-2 rounded shadow">
              <span>{q.questionText}</span>

              {q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0 ? (
                q.options.map((opt, idx) => (
                  <label
                    key={`${q._id}-${idx}`}
                    className={`block p-2 rounded mb-2 cursor-pointer transition-colors duration-200 ${
                      answers[q._id] === opt ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      value={opt}
                      onChange={(e) => handleChange(q._id, e.target.value)}
                      className="mr-2"
                      checked={answers[q._id] === opt}
                    />
                    {opt}
                  </label>
                ))
              ) : q.type === 'boolean' ? (
                ['True', 'False'].map((opt, idx) => (
                  <label
                    key={`${q._id}-${idx}`}
                    className={`block p-2 rounded mb-2 cursor-pointer transition-colors duration-200 ${
                      answers[q._id] === opt ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      value={opt}
                      onChange={(e) => handleChange(q._id, e.target.value)}
                      className="mr-2"
                      checked={answers[q._id] === opt}
                    />
                    {opt}
                  </label>
                ))
              ) : q.type === 'short' ? (
                <input
                  type="text"
                  className="w-full p-2 bg-gray-700 mt-2 rounded text-white"
                  onChange={(e) => handleChange(q._id, e.target.value)}
                  value={answers[q._id] || ''}
                />
              ) : (
                <p>No options available for this question.</p>
              )}
            </li>
          ))
        ) : (
          <p>No questions available.</p>
        )}
      </ol>
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded text-white font-bold cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default Exam;
