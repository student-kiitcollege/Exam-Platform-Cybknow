import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MonitoringPanel = () => {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [questionsMap, setQuestionsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/submission/getAll');
        if (!res.ok) {
          throw new Error('Failed to fetch submissions');
        }
        const data = await res.json();

        const qMap = {};
        data.forEach(sub => {
          sub.answers.forEach(ans => {
            if (ans.question) {
              qMap[ans.question._id] = ans.question;
            }
          });
        });
        setQuestionsMap(qMap);
        setSubmissions(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Error fetching data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-white p-4">Loading monitoring data...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="min-h-screen bg-black bg-opacity-90 overflow-auto p-8 z-50 text-white">
      <button
        onClick={() => navigate('/teacher-dashboard')}
        className="mb-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700 font-semibold hover:cursor-pointer"
      >
        Back to Dashboard
      </button>

      <h2 className="text-3xl mb-6 font-bold">Monitoring Panel - Student Submissions</h2>

      {submissions.length === 0 && <p>No submissions found.</p>}

      {submissions.map((submission, i) => (
        <div key={i} className="mb-12 bg-gray-800 rounded p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-2">
            Student: <span className="text-blue-400">{submission.studentEmail}</span>
          </h3>

          <table className="w-full table-auto border-collapse border border-gray-700">
            <thead>
              <tr className="bg-indigo-700">
                <th className="border border-gray-600 px-3 py-2 text-left">Question</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Student Answer</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Correct Answer</th>
              </tr>
            </thead>
            <tbody>
              {submission.answers.map((ans, idx) => {
                const question = ans.question || questionsMap[ans.questionId];
                return (
                  <tr key={idx} className="even:bg-gray-700 odd:bg-gray-600">
                    <td className="border border-gray-600 px-3 py-2 max-w-xs">{question?.questionText || 'N/A'}</td>
                    <td className={`border border-gray-600 px-3 py-2 ${ans.answer === question?.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                      {ans.answer || 'No answer'}
                    </td>
                    <td className="border border-gray-600 px-3 py-2">{question?.correctAnswer || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MonitoringPanel;
