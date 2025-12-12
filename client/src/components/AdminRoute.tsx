import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Check if user exists AND is an admin
  if (user && user.role === 'admin') {
    return <Outlet />;
  } else {
    // If not admin, kick them back to normal dashboard
    return <Navigate to="/dashboard" replace />;
  }
};

export default AdminRoute;