import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    // Remove token from localStorage if it exists but not in Redux state
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
