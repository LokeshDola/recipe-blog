import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const user = localStorage.getItem('user');

    if (!user) {
        // If no user is logged in, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // If user is logged in, show the page
    return children;
}

export default ProtectedRoute;