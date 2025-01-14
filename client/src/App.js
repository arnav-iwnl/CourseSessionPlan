// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HodPage from './Components/MainPage/HODPage';
import FacultyPage from './Components/MainPage/FacultyPage';
import AuthPage from './Components/LoginPage/AuthPage';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './Context/authContext';
import MappingCO from './Components/MappingCO/MappingCO';
import FacultyPageLab from './Components/MainPage/Labs/FacultyPageLab';


function App() {
  const [user, setUser] = useState(null); // User state to track logged-in user

  const handleLogin = (email) => {
    setUser({ email }); // Set the user with the email
  };

  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
            <Route
              path="/faculty"
              element={
                <ProtectedRoute isAllowed={user}>
                  <FacultyPageLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod"
              element={
                <ProtectedRoute isAllowed={user && user.email.includes('hod')}>
                  <HodPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mapping"
              element={
                <ProtectedRoute isAllowed={user}>
                  <MappingCO />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>

  );
}

export default App;
