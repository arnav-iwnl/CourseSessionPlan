// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DynamicForm from './Components/Test';
import HodPage from './Components/MainPage/HODPage';
import FacultyPage from './Components/MainPage/FacultyPage';
import AuthPage from './Components/LoginPage/AuthPage';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null); // User state to track logged-in user

  const handleLogin = (email) => {
    setUser({ email }); // Set the user with the email
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute isAllowed={user}>
                <FacultyPage />
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
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Router>


      
      {/* <DynamicForm /> */}

    </div>
  );
}

export default App;
