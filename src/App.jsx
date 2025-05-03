import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import TestProgressSystem from './components/TestProgressSystem'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import ProfilePage from './components/profile/ProfilePage'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function App() {
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, currentUser } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
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
