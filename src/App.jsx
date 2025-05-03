import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import TestProgressSystem from './components/TestProgressSystem'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ProfilePage from './components/profile/ProfilePage'
import ModuleDetailsPage from './components/modules/ModuleDetailsPage'
import TeacherPanel from './components/teacher/TeacherPanel'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function App() {
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, currentUser, tokens } = useAuth();
    console.log('ProtectedRoute - Tokens:', tokens);

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const TeacherRoute = ({ children }) => {
    const { isAuthenticated, currentUser, isTeacher } = useAuth();
    console.log('TeacherRoute - isAuthenticated:', isAuthenticated);
    console.log('TeacherRoute - isTeacher:', isTeacher);

    if (!isAuthenticated) {
      console.log('TeacherRoute - Not authenticated, redirecting to login');
      return <Navigate to="/login" />;
    }

    // Check if the user has the teacher role
    if (!isTeacher) {
      console.log('TeacherRoute - Not a teacher, redirecting to profile');
      return <Navigate to="/profile" />;
    }

    return children;
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/modules/:id" element={
              <ProtectedRoute>
                <ModuleDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher" element={
              <TeacherRoute>
                <TeacherPanel />
              </TeacherRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <TestProgressSystem />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
