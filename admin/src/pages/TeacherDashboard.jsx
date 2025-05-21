import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faBell, faCalendarAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [teacherEmail, setTeacherEmail] = useState('');
  const [notifications, setNotifications] = useState([
    'New student registered: John Doe',
    "Exam 'Math Exam' scheduled for May 30 confirmed.",
    'System maintenance on June 1, expect downtime.',
  ]);
  const [highlightedExam, setHighlightedExam] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('teacherToken');
    const email = localStorage.getItem('teacherEmail');
    if (!token) {
      navigate('/teacher-login');
    } else {
      setTeacherEmail(email);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherEmail');
    navigate('/teacher-login');
  };

  const exams = [
    {
      id: 1,
      name: 'Math Exam',
      date: 'May 30, 2025',
      description: 'Class 10A - Algebra & Geometry',
    },
    {
      id: 2,
      name: 'Physics Quiz',
      date: 'June 5, 2025',
      description: 'Class 9B - Mechanics',
    },
    {
      id: 3,
      name: 'Chemistry Test',
      date: 'June 12, 2025',
      description: 'Class 10C - Organic Chemistry',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 text-white p-8 flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-wide drop-shadow-lg">
            Welcome, {teacherEmail || 'Teacher'}!
          </h1>
          <p className="text-lg text-indigo-200 max-w-lg">
            Manage your exams, monitor students, and check your schedules here.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 transition duration-300 px-5 py-2 rounded font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer select-none"
          aria-label="Logout"
          title="Logout"
        >
          Logout
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-10 flex-grow">
        {/* Upcoming Exams */}
        <section className="bg-indigo-900 bg-opacity-80 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-5 border-b border-indigo-400 pb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-indigo-400" />
            Upcoming Exams
          </h2>
          <ul className="space-y-4">
            {exams.map((exam) => (
              <li
                key={exam.id}
                onClick={() => setHighlightedExam(exam.id)}
                className={`bg-indigo-800 p-4 rounded cursor-pointer transition transform hover:bg-indigo-700 hover:scale-[1.02] shadow-md ${
                  highlightedExam === exam.id ? 'ring-2 ring-indigo-400' : ''
                }`}
                tabIndex={0}
                role="button"
                aria-pressed={highlightedExam === exam.id}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setHighlightedExam(exam.id);
                  }
                }}
              >
                <strong className="text-white text-lg">{exam.name}</strong> - {exam.date}
                <p className="text-indigo-300 text-sm mt-1">{exam.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Student Monitoring */}
        <section className="bg-indigo-900 bg-opacity-80 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-400 pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faEye} className="text-indigo-400" />
              Student Monitoring
            </h2>
            <p className="text-indigo-300 mb-6 leading-relaxed">
              View live webcam snapshots and exam activity logs to ensure exam integrity.
            </p>
          </div>
          <button
            onClick={() => navigate('/monitoring')}
            className="bg-purple-600 hover:bg-purple-700 transition duration-300 rounded px-5 py-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer select-none self-start"
            aria-label="Open Monitoring Panel"
            title="Open Monitoring Panel"
          >
            Open Monitoring Panel
          </button>
        </section>

        {/* Notifications */}
        <section className="bg-indigo-900 bg-opacity-80 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-400 pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faBell} className="text-indigo-400" />
              Notifications{' '}
              <span
                className="ml-2 inline-block bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold leading-none select-none"
                aria-label={`${notifications.length} new notifications`}
              >
                {notifications.length}
              </span>
            </h2>
            <ul className="space-y-2 text-indigo-300 text-sm max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-indigo-900">
              {notifications.map((note, idx) => (
                <li key={idx} className="hover:text-white transition cursor-default select-text">
                  {note}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="mt-6 bg-purple-600 hover:bg-purple-700 transition duration-300 rounded px-5 py-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer select-none"
            aria-label="View All Notifications"
            title="View All Notifications"
            onClick={() => alert('Feature coming soon!')}
          >
            View All Notifications
          </button>
        </section>
      </main>

      <footer className="mt-16 text-center text-indigo-200 text-sm select-none">
        &copy; 2025 CybknowExam • All rights reserved
      </footer>
    </div>
  );
};

export default TeacherDashboard;
