// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HodPage from './Components/MainPage/HODPage.js';
import FacultyPage from './Components/MainPage/FacultyPage.js';
import AuthPage from './Components/LoginPage/AuthPage.js';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './Context/authContext.js';
// import MappingCO from './Components/MappingCO/MappingCO';

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
                  <FacultyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod"
              element={
                <ProtectedRoute isAllowed={user && user.email.startsWith('hod')}>
                  <HodPage />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/mapping"
              element={
                <ProtectedRoute isAllowed={user}>
                  <MappingCO />
                </ProtectedRoute>
              }
            /> */}
            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
    // <> 
    //  <MappingCO />
    // </>
  );
}

export default App;
