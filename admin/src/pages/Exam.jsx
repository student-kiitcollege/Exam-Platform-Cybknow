import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Exam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const videoRef = useRef(null);
  const questionRefs = useRef([]);

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
        const url = new URL('http://localhost:5000/api/questions/getquestions');
        if (user?.email) {
          url.searchParams.append('email', user.email);
        }

        const response = await fetch(url.toString());
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

    if (user?.email) {
      fetchQuestions();
    } else {
      setError('User not logged in.');
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    questionRefs.current = questionRefs.current.slice(0, questions.length);
  }, [questions]);

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

  const handleSubmit = async () => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        console.log('Camera and microphone stopped on submit.');
      }

      for (const q of questions) {
        if (!answers[q._id] || answers[q._id].toString().trim() === '') {
          alert(`Please answer question ${q._id} before submitting.`);
          return;
        }
      }

      const formattedAnswers = questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id],
      }));

      const payload = {
        studentEmail: user?.email,
        answers: formattedAnswers,
      };

      const response = await fetch('http://localhost:5000/api/submission/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed.');
      }

      alert('Your exam has been submitted successfully.');
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Failed to submit exam. Please try again.');
    }
  };

  const scrollToQuestion = (index) => {
    if (questionRefs.current[index]) {
      questionRefs.current[index].scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    }
  };

  if (loading) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Loading questions...</div>;
  }

  if (error) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Error: {error}</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen relative">
      <h1 className="text-3xl mb-2 font-bold">Student Email: {user?.email}</h1>
      <div className="mb-6 flex justify-between items-center pr-32 text-lg">
        <p>Total Questions: <span className="font-semibold">{questions.length}</span></p>
        <p>Time Left: <span className="font-semibold text-red-400">{timeLeft}s</span></p>
      </div>

      <div className="fixed top-4 right-4 w-28 h-28 overflow-hidden border-4 border-blue-600 shadow-lg z-50">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      <div className="fixed top-4 right-40 flex flex-wrap gap-2 z-50">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToQuestion(index)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full text-sm shadow"
          >
            {index + 1}
          </button>
        ))}
      </div>

      <ol className="space-y-6">
        {questions.map((q, index) => (
          <li
            key={q._id}
            ref={(el) => (questionRefs.current[index] = el)}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">
              Q{index + 1}. {q.questionText}
            </h2>

            {q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0 ? (
              q.options.map((opt, idx) => (
                <label
                  key={`${q._id}-${idx}`}
                  className={`block px-4 py-2 rounded-lg mb-2 cursor-pointer border transition-all duration-200 ${
                    answers[q._id] === opt
                      ? 'bg-blue-600 border-blue-400'
                      : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    onChange={(e) => handleChange(q._id, e.target.value)}
                    checked={answers[q._id] === opt}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))
            ) : q.type === 'boolean' ? (
              ['True', 'False'].map((opt, idx) => (
                <label
                  key={`${q._id}-${idx}`}
                  className={`block px-4 py-2 rounded-lg mb-2 cursor-pointer border transition-all duration-200 ${
                    answers[q._id] === opt
                      ? 'bg-blue-600 border-blue-400'
                      : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name={q._id}
                    value={opt}
                    onChange={(e) => handleChange(q._id, e.target.value)}
                    checked={answers[q._id] === opt}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))
            ) : q.type === 'short' ? (
              <input
                type="text"
                className="w-full p-3 bg-gray-700 mt-2 rounded-lg text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleChange(q._id, e.target.value)}
                value={answers[q._id] || ''}
              />
            ) : (
              <p className="text-red-400">No options available for this question.</p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-12 flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl text-white font-bold shadow-md transition-all duration-200 hover:cursor-pointer"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default Exam;
