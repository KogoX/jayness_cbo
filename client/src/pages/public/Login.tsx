import React from 'react';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  return <Navigate to="/?auth=signin" replace />;
};

export default Login;
