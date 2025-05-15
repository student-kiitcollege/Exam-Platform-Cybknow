import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from '../Component/NavbarComponent';
import Footer from '../Component/Footer';
import { FaUserAlt } from "react-icons/fa";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleStartExam = () => {
    navigate('/exam/123'); 
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
          <div className="flex items-center space-x-2">
            <FaUserAlt className="text-xl" />
            <span className="text-lg font-semibold">User Name</span>
          </div>
        </nav>

        <section className="bg-white shadow-md rounded-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Ready To Start</h1>
          <ul className="text-lg text-gray-700 mb-6 space-y-2">
            <li><strong>Total Questions:</strong> {examInfo.totalQuestions}</li>
            <li><strong>Total Marks:</strong> {examInfo.totalMarks}</li>
            <li><strong>Negative Marking:</strong> {examInfo.negativeMarking}</li>
          </ul>
          <button
            onClick={handleStartExam}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition duration-300 cursor-pointer"
          >
            Start Exam
          </button>
        </section>

        <section className="bg-white shadow-md rounded-md p-6 text-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Terms and Conditions</h2>
          <ul className="list-disc pl-6 space-y-2 text-base">
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
