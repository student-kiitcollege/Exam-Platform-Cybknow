import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';

const MonitoringPanel = () => {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState({}); // Track expanded submissions per student

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/submission/getAll');
        if (!res.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const data = await res.json();
        setSubmissions(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Group submissions by student email
  const groupedByStudent = submissions.reduce((acc, sub) => {
    acc[sub.studentEmail] = acc[sub.studentEmail] || [];
    acc[sub.studentEmail].push(sub);
    return acc;
  }, {});

  // Helper to format date string nicely
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Calculate stats for a submission
  const calculateStats = (answers) => {
    let correctCount = 0;
    let wrongCount = 0;
    answers.forEach((ans) => {
      const question = ans.question || { correctAnswer: null };
      if (ans.answer === question.correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    // Negative marking: every 3 wrong answers deduct 1 mark
    const negativeMarks = Math.floor(wrongCount / 3);
    const score = correctCount - negativeMarks;

    return { correctCount, totalQuestions: answers.length, wrongCount, negativeMarks, score };
  };

  // Toggle expand/collapse of submissions for a student
  const toggleExpand = (email) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  if (loading) return <p className="text-white p-4">Loading monitoring data...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 overflow-auto p-8 z-50 text-white">
      <button
        onClick={() => navigate('/teacher-dashboard')}
        className="mb-6 px-4 py-2 bg-red-600 rounded hover:bg-red-700 font-semibold flex items-center space-x-2 cursor-pointer"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Dashboard</span>
      </button>

      <h2 className="text-4xl mb-6 font-bold text-center text-indigo-400">📊 Monitoring Panel</h2>
      <p className="mb-10 text-center text-gray-300 text-lg">Live overview of student exam submissions</p>

      {Object.keys(groupedByStudent).length === 0 && (
        <p className="text-gray-300 text-center">No submissions found.</p>
      )}

      {Object.entries(groupedByStudent).map(([studentEmail, studentSubs]) => (
        <div
          key={studentEmail}
          className="mb-12 bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
        >
          <div
            className="flex justify-between items-center mb-4 cursor-pointer"
            onClick={() => toggleExpand(studentEmail)}
          >
            <h3 className="text-2xl font-semibold text-blue-400">
              👤 Student: {studentEmail}
            </h3>
            <div className="text-indigo-400 flex items-center space-x-1 select-none">
              <span>
                {studentSubs.length} submission{studentSubs.length > 1 ? 's' : ''}
              </span>
              <FontAwesomeIcon icon={expandedStudents[studentEmail] ? faChevronUp : faChevronDown} />
            </div>
          </div>

          {expandedStudents[studentEmail] &&
            studentSubs.map((submission, idx) => {
              const { correctCount, totalQuestions, wrongCount, negativeMarks, score } =
                calculateStats(submission.answers);

              return (
                <div
                  key={idx}
                  className="mb-8 border border-gray-600 rounded-md p-4 bg-gray-900"
                >
                  <p className="text-sm text-gray-400 mb-2">
                    🕒 Submitted at: {formatDateTime(submission.submittedAt)}
                  </p>

                  <p className="text-sm mb-4">
                    ✅ Correct: <span className="text-green-400 font-semibold">{correctCount}</span> / {totalQuestions} |{' '}
                    ❌ Wrong: <span className="text-red-400 font-semibold">{wrongCount}</span> |{' '}
                    🧾 Negative Marks: <span className="text-yellow-400 font-semibold">-{negativeMarks}</span> |{' '}
                    🎯 <span className="font-bold">{score >= 0 ? score : 0}</span> Marks
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse border border-gray-700 text-sm">
                      <thead>
                        <tr className="bg-indigo-700 text-white">
                          <th className="border border-gray-600 px-4 py-2 text-left">Question</th>
                          <th className="border border-gray-600 px-4 py-2 text-left">Answer</th>
                          <th className="border border-gray-600 px-4 py-2 text-left">Correct Answer</th>
                          <th className="border border-gray-600 px-4 py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submission.answers.map((ans, i) => {
                          const question = ans.question || { questionText: 'N/A', correctAnswer: 'N/A' };
                          const isCorrect = ans.answer === question.correctAnswer;

                          return (
                            <tr key={i} className="even:bg-gray-700 odd:bg-gray-600">
                              <td className="border border-gray-600 px-4 py-2 max-w-xs break-words">
                                {question.questionText}
                              </td>
                              <td
                                className={`border border-gray-600 px-4 py-2 ${
                                  isCorrect ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {ans.answer || 'Not answered'}
                              </td>
                              <td className="border border-gray-600 px-4 py-2">{question.correctAnswer}</td>
                              <td className="border border-gray-600 px-4 py-2 text-center">
                                <FontAwesomeIcon
                                  icon={isCorrect ? faCheckCircle : faTimesCircle}
                                  className={isCorrect ? 'text-green-400' : 'text-red-400'}
                                  title={isCorrect ? 'Correct' : 'Incorrect'}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

          {!expandedStudents[studentEmail] && (
            <p className="text-gray-400 italic text-sm select-none">
              Click student header to view submission details
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default MonitoringPanel;
