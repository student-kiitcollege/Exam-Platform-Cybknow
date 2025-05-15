import React, { useEffect, useState } from 'react';
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
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

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
    if (loading || error || showResults) return;

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
  }, [loading, error, showResults]);

  useEffect(() => {
    if (isTimeUp) {
      handleSubmit();
    }
  }, [isTimeUp]);

  const handleChange = (id, value) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [id]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q._id] && q.correctAnswer) {
        if (
          answers[q._id].toString().toLowerCase() ===
          q.correctAnswer.toString().toLowerCase()
        ) {
          correctCount++;
        }
      }
    });
    setScore(correctCount);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/',{ replace: true });
  };

  if (loading) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Loading questions...</div>;
  }

  if (error) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Error: {error}</div>;
  }

  if (showResults) {
    return (
      <div className="p-8 bg-gray-900 text-white min-h-screen flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-6">Exam Results</h1>
          <p className="mb-4 text-lg">
            Your Correct answer <span className="font-semibold">{score}</span> out of{' '}
            <span className="font-semibold">{questions.length}</span> questions .
          </p>
          <ol className="list-decimal list-inside space-y-4">
            {questions.map((q) => {
              const userAnswer = answers[q._id] || 'No answer';
              const correctAnswer = q.correctAnswer || 'No correct answer provided';
              const isCorrect =
                userAnswer.toString().toLowerCase() === correctAnswer.toString().toLowerCase();

              return (
                <li key={q._id} className="bg-gray-800 p-4 rounded shadow">
                  <p className="font-semibold">{q.questionText}</p>
                  <p>
                    Your answer:{' '}
                    <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                      {userAnswer}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p>
                      Correct answer:{' '}
                      <span className="text-green-400">{correctAnswer}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded text-white font-bold cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl mb-4 font-bold">Exam ID: {examId}</h1>
      <p className="mb-4 text-lg">
        Time Left: <span className="font-semibold">{timeLeft}s</span>
      </p>
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
      <div className="mt-8">
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
