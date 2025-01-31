import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Balances from './pages/Balances';
import Bills from './pages/Bills';
import Expenses from './pages/Expenses';
import Goals from './pages/Goals';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/balances"
        element={
          <PrivateRoute>
            <Layout>
              <Balances />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <PrivateRoute>
            <Layout>
              <Transactions />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/add-transaction"
        element={
          <PrivateRoute>
            <Layout>
              <AddTransaction />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bills"
        element={
          <PrivateRoute>
            <Layout>
              <Bills />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <PrivateRoute>
            <Layout>
              <Expenses />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <PrivateRoute>
            <Layout>
              <Goals />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
