import React from 'react';
import { Navigate } from 'react-router-dom';

const Register: React.FC = () => {
  return <Navigate to="/?auth=signup" replace />;
};

export default Register;
