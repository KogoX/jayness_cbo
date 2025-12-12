import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check if token exists in localStorage
  const token = localStorage.getItem('token');

  // If no token, redirect to Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the child component (The Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;