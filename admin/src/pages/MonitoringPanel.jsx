import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
  faArrowLeft,
  faChevronDown,
  faChevronUp,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

const MonitoringPanel = () => {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/submission/getAll');
        if (!res.ok) throw new Error('Failed to fetch submissions');
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

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && previewImage) {
      setPreviewImage(null);
    }
  }, [previewImage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDelete = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/submission/delete/${submissionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete submission');
      setSubmissions((prevSubs) => prevSubs.filter((sub) => sub._id !== submissionId));
    } catch (err) {
      alert(err.message || "Error deleting submission");
    }
  };

  const groupedByStudent = submissions.reduce((acc, sub) => {
    if (!acc[sub.studentEmail]) acc[sub.studentEmail] = [];
    acc[sub.studentEmail].push(sub);
    return acc;
  }, {});

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
    const negativeMarks = Math.floor(wrongCount / 3);
    const score = correctCount - negativeMarks;
    return { correctCount, totalQuestions: answers.length, wrongCount, negativeMarks, score };
  };

  const toggleExpand = (email) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  };

  if (loading) return <p className="text-white p-6 text-center text-lg font-semibold">Loading monitoring data...</p>;
  if (error) return <p className="text-red-500 p-6 text-center text-lg font-semibold">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 overflow-auto p-8 text-white select-none">
      <button
        onClick={() => navigate('/teacher-dashboard')}
        className="cursor-pointer mb-6 inline-flex items-center space-x-2 px-5 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-300 font-semibold shadow-lg"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Dashboard</span>
      </button>

      <h2 className="text-4xl mb-6 font-extrabold text-center text-indigo-400 tracking-wide">📊 Monitoring Panel</h2>
      <p className="mb-10 text-center text-gray-300 text-lg max-w-3xl mx-auto">
        Live overview of student exam submissions — review answers and snapshots to ensure exam integrity.
      </p>

      {Object.keys(groupedByStudent).length === 0 && (
        <p className="text-gray-400 text-center italic">No submissions found.</p>
      )}

      {Object.entries(groupedByStudent).map(([studentEmail, studentSubs]) => (
        <section
          key={studentEmail}
          className="mb-12 bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-indigo-500 max-w-6xl mx-auto"
        >
          <header
            className="flex justify-between items-center mb-4 cursor-pointer"
            onClick={() => toggleExpand(studentEmail)}
          >
            <h3 className="text-2xl font-semibold text-blue-400 truncate max-w-[70%]">
              👤 {studentEmail}
            </h3>
            <div className="flex items-center space-x-2 text-indigo-400 font-medium">
              <span>{studentSubs.length} submission{studentSubs.length > 1 ? 's' : ''}</span>
              <FontAwesomeIcon icon={expandedStudents[studentEmail] ? faChevronUp : faChevronDown} />
            </div>
          </header>

          {expandedStudents[studentEmail] && (
            <div className="space-y-10 transition-all duration-300 ease-in-out">
              {studentSubs.map((submission, idx) => {
                const { correctCount, totalQuestions, wrongCount, negativeMarks, score } = calculateStats(submission.answers);
                const examStart = new Date(submission.examStartTime);
                const submitted = new Date(submission.submittedAt);
                const duration = Math.floor((submitted - examStart) / 60000);

                return (
                  <article key={idx} className="bg-gray-900 rounded-md p-6 border border-gray-700 shadow-md">
                    <div className="inline-block px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 rounded-full mb-3 shadow-sm">
                      🎬 Started: {examStart.toLocaleTimeString()}
                    </div>

                    <div className="text-sm space-y-1 mb-4 text-gray-300">
                      <p>
                        🟢 <strong className="text-green-400">Exam Started:</strong>{' '}
                        <time dateTime={submission.examStartTime}>{formatDateTime(submission.examStartTime)}</time>
                      </p>
                      <p>
                        🕒 <strong className="text-yellow-300">Submitted At:</strong>{' '}
                        <time dateTime={submission.submittedAt}>{formatDateTime(submission.submittedAt)}</time>
                      </p>
                      <p>
                        ⏱️ <strong className="text-indigo-300">Duration:</strong> {duration} mins
                      </p>
                    </div>

                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="cursor-pointer text-sm px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition duration-200 flex items-center space-x-2"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                        <span>Delete</span>
                      </button>
                    </div>

                    <p className="text-sm mb-6">
                      ✅ Correct: <span className="text-green-400 font-semibold">{correctCount}</span> / {totalQuestions} |{' '}
                      ❌ Wrong: <span className="text-red-400 font-semibold">{wrongCount}</span> |{' '}
                      🧾 Negative: <span className="text-yellow-400 font-semibold">-{negativeMarks}</span> |{' '}
                      🎯 Score: <span className={`font-bold ${score >= 5 ? 'text-green-400' : score >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{score >= 0 ? score : 0}</span>
                    </p>

                    <div className="overflow-x-auto rounded-md border border-gray-700 shadow-inner mb-6">
                      <table className="w-full border-collapse text-sm">
                        <thead className="bg-indigo-700 text-white">
                          <tr>
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
                              <tr key={i} className="even:bg-gray-700 odd:bg-gray-600 hover:bg-indigo-800 transition-colors">
                                <td className="border border-gray-600 px-4 py-2">{question.questionText}</td>
                                <td className="border border-gray-600 px-4 py-2">{ans.answer || <em>No answer</em>}</td>
                                <td className="border border-gray-600 px-4 py-2">{question.correctAnswer || 'N/A'}</td>
                                <td
                                  className={`border border-gray-600 px-4 py-2 text-center ${
                                    isCorrect ? 'text-green-400' : 'text-red-400'
                                  }`}
                                >
                                  <FontAwesomeIcon icon={isCorrect ? faCheckCircle : faTimesCircle} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {submission.snapshots && submission.snapshots.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3 text-indigo-300">Snapshots:</h4>
                        <div className="flex flex-wrap gap-3">
                          {submission.snapshots.map((snap, idx) => (
                            <div
                              key={idx}
                              className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-600 cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => setPreviewImage(snap.image)}
                              title={`Snapshot taken at: ${formatDateTime(snap.timestamp)}`}
                            >
                              <img
                                src={snap.image}
                                alt={`Snapshot ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <p className="absolute bottom-0 left-0 right-0 text-xs bg-black bg-opacity-70 text-white px-1 py-0.5 text-center select-text">
                                {new Date(snap.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ))}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setPreviewImage(null)}
          aria-label="Close image preview"
          role="dialog"
          tabIndex={-1}
        >
          <img
            src={previewImage}
            alt="Snapshot preview"
            className="max-w-full max-h-full rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default MonitoringPanel;
