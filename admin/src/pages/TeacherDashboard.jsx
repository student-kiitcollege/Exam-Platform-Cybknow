import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('teacherToken');
    if (!token) {
      navigate('/teacher-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    localStorage.removeItem('teacherEmail');
    navigate('/teacher-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800 text-white p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Welcome, Teacher!</h1>
          <p className="text-lg text-indigo-200">
            Manage your exams, monitor students, and check your schedules here.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded font-semibold shadow cursor-pointer"
        >
          Logout
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="bg-indigo-900 bg-opacity-70 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-400 pb-2">
            📅 Upcoming Exams
          </h2>
          <ul className="space-y-3">
            <li className="bg-indigo-800 p-3 rounded hover:bg-indigo-700 transition cursor-pointer">
              <strong>Math Exam</strong> - May 30, 2025
              <p className="text-indigo-300 text-sm">Class 10A - Algebra & Geometry</p>
            </li>
            <li className="bg-indigo-800 p-3 rounded hover:bg-indigo-700 transition cursor-pointer">
              <strong>Physics Quiz</strong> - June 5, 2025
              <p className="text-indigo-300 text-sm">Class 9B - Mechanics</p>
            </li>
            <li className="bg-indigo-800 p-3 rounded hover:bg-indigo-700 transition cursor-pointer">
              <strong>Chemistry Test</strong> - June 12, 2025
              <p className="text-indigo-300 text-sm">Class 10C - Organic Chemistry</p>
            </li>
          </ul>
        </section>

        <section className="bg-indigo-900 bg-opacity-70 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-400 pb-2">
            👀 Student Monitoring
          </h2>
          <p className="text-indigo-300 mb-4">
            View live webcam snapshots and exam activity logs to ensure exam integrity.
          </p>
          <button
            onClick={() => navigate('/monitoring')}
            className="bg-purple-600 hover:bg-purple-700 transition rounded px-4 py-2 font-semibold shadow hover:cursor-pointer"
          >
            Open Monitoring Panel
          </button>
        </section>

        <section className="bg-indigo-900 bg-opacity-70 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-400 pb-2">
            🔔 Notifications
          </h2>
          <ul className="space-y-2 text-indigo-300 text-sm">
            <li>New student registered: John Doe</li>
            <li>Exam 'Math Exam' scheduled for May 30 confirmed.</li>
            <li>System maintenance on June 1, expect downtime.</li>
          </ul>
          <button className="mt-4 bg-purple-600 hover:bg-purple-700 transition rounded px-4 py-2 font-semibold shadow">
            View All Notifications
          </button>
        </section>
      </main>

      <footer className="mt-16 text-center text-indigo-200 text-sm">
        &copy; 2025 CybknowExam • All rights reserved
      </footer>
    </div>
  );
};

export default TeacherDashboard;
