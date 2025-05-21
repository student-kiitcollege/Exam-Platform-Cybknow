import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Exam from './pages/Exam';
import TeacherLogin from './pages/TeacherLogin'; // ✅ NEW Import
import ProtectedRoute from './Component/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TeacherDashboard from './pages/TeacherDashboard';
import MonitoringPanel from './pages/MonitoringPanel';

function AppRoutes() {
  const { user, token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user && token ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route path="/teacher-login" element={<TeacherLogin />} /> {/* ✅ NEW Route */}
      <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      <Route path="/monitoring" element={<MonitoringPanel />} />



      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId"
        element={
          <ProtectedRoute>
            <Exam />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
