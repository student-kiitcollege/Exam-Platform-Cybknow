import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Webcam from 'react-webcam';

const Exam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [examStartTime, setExamStartTime] = useState(null);

  const webcamRef = useRef(null);
  const questionRefs = useRef([]);
  const snapshotIntervalRef = useRef(null);

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
        setExamStartTime(new Date().toISOString()); 
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
      const timer = setTimeout(() => {
        handleSubmit();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTimeUp]);

  useEffect(() => {
    snapshotIntervalRef.current = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          setSnapshots((prev) => [...prev, { image: imageSrc, timestamp: new Date().toISOString() }]);
        }
      }
    }, 10000);

    return () => {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    try {
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }

      const formattedAnswers = questions.map(q => ({
        questionId: q._id,
        answer: (answers[q._id]?.toString().trim()) || "",
      }));

      const payload = {
        studentEmail: user?.email,
        examStartTime,
        answers: formattedAnswers,
        snapshots,
        submittedAt: new Date().toISOString(),
      };

      const response = await fetch('http://localhost:5000/api/submission/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      alert('Failed to submit exam: ' + err.message);
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

  const handleOptionToggle = (questionId, value) => {
    setAnswers((prevAnswers) => {
      if (prevAnswers[questionId] === value) {
        const newAnswers = { ...prevAnswers };
        delete newAnswers[questionId];
        return newAnswers;
      }
      return { ...prevAnswers, [questionId]: value };
    });
  };

  const handleChange = (id, value) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [id]: value }));
  };

  if (loading) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen flex justify-center items-center text-xl font-semibold">Loading questions...</div>;
  }

  if (error) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen flex justify-center items-center text-xl font-semibold">Error: {error}</div>;
  }

  const timerPercentage = (timeLeft / 60) * 100;
  let timerColor = 'bg-green-500';
  if (timeLeft <= 10) timerColor = 'bg-red-500';
  else if (timeLeft <= 20) timerColor = 'bg-yellow-400';

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen w-full">
      <h1 className="text-3xl mb-4 font-extrabold tracking-wide">Exam in Progress</h1>
      <p className="mb-8 text-indigo-300">
        Student Email: <span className="font-semibold text-white">{user?.email}</span>
      </p>

      <div className="mb-6 flex justify-between items-center pr-32 text-lg select-none">
        <p>Total Questions: <span className="font-semibold">{questions.length}</span></p>
        <div className="flex flex-col items-end w-48">
          <p className="mb-1">
            Time Left: <span className={`font-semibold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>{timeLeft}s</span>
          </p>
          <div className="w-full h-3 rounded-full bg-gray-700 overflow-hidden shadow-inner">
            <div
              className={`${timerColor} h-full transition-all duration-500 ease-in-out`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="fixed top-6 right-6 w-32 h-32 rounded-xl border-4 border-blue-600 shadow-lg overflow-hidden z-50 bg-black">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          mirrored={true}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="fixed top-6 right-44 flex flex-wrap gap-2 max-w-[calc(100vw-16rem)] z-50">
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

      <ol className="space-y-8 w-full">
        {questions.map((q, index) => (
          <li
            key={q._id}
            ref={(el) => (questionRefs.current[index] = el)}
            className="bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-700 hover:border-blue-500 transition-all"
          >
            <h2 className="text-2xl font-semibold mb-6">
              Q{index + 1}. {q.questionText}
            </h2>

            {(q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0) || q.type === 'boolean' ? (
              ((q.type === 'boolean' ? ['True', 'False'] : q.options) || []).map((opt, idx) => {
                const selected = answers[q._id] === opt;
                return (
                  <div
                    key={`${q._id}-${idx}`}
                    onClick={() => handleOptionToggle(q._id, opt)}
                    className={`cursor-pointer px-5 py-3 rounded-lg mb-3 border-2
                      ${selected ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-500'}
                      hover:scale-[1.02]`}
                  >
                    <input
                      type="radio"
                      name={q._id}
                      value={opt}
                      checked={selected}
                      readOnly
                      className="mr-3"
                    />
                    {opt}
                  </div>
                );
              })
            ) : q.type === 'short' ? (
              <input
                type="text"
                className="w-full p-4 bg-gray-700 rounded-xl text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleChange(q._id, e.target.value)}
                value={answers[q._id] || ''}
                placeholder="Type your answer here..."
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
          className="cursor-pointer bg-green-600 hover:bg-green-700 px-10 py-4 rounded-3xl text-white font-extrabold shadow-lg hover:scale-105"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default Exam;
