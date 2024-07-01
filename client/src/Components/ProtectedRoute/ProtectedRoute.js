// src/Components/ProtectedRoute/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAllowed, children }) => {
  if (!isAllowed) {
    return <Navigate to="/auth" replace />;
  }

  return React.cloneElement(children, { user: isAllowed });
};

export default ProtectedRoute;