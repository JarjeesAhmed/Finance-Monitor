import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, let axios set the correct content-type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Signup Error:', error.response?.data || error.message);
    throw error;
  }
};

// Transactions API
export const getTransactions = async ({ page, limit, type, category, startDate, endDate }) => {
  try {
    const params = { page, limit, type, category, startDate, endDate };
    const response = await api.get('/transactions', { params });
    return response.data;
  } catch (error) {
    console.error('Get Transactions Error:', error.response?.data || error.message);
    throw error;
  }
};

export const addTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Add Transaction Error:', error.response?.data || error.message);
    throw error;
  }
};

export const updateTransaction = async (id, transactionData) => {
  try {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  } catch (error) {
    console.error('Update Transaction Error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete Transaction Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTransaction = async (id) => {
  try {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get Transaction Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTransactionsByCategory = async (category) => {
  try {
    const response = await api.get(`/transactions?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Get Transactions By Category Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTransactionsByDate = async (date) => {
  try {
    const response = await api.get(`/transactions?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Get Transactions By Date Error:', error.response?.data || error.message);
    throw error;
  }
};

// Category API calls
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Get Categories Error:', error.response?.data || error.message);
    throw error;
  }
};

export const addCategory = async (categoryData) => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Add Category Error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Delete Category Error:', error.response?.data || error.message);
    throw error;
  }
};

// Account Management
export const getAccounts = () => api.get('/accounts');
export const addAccount = (data) => api.post('/accounts', data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

// Bill Management
export const getBills = () => api.get('/bills');
export const addBill = (data) => api.post('/bills', data);
export const updateBill = (id, data) => api.put(`/bills/${id}`, data);
export const deleteBill = (id) => api.delete(`/bills/${id}`);
export const markBillAsPaid = (id) => api.put(`/bills/${id}/pay`);

// Goal Management
export const getGoals = () => api.get('/goals');
export const addGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export const updateGoalProgress = (id, amount) => api.patch(`/goals/${id}/contribute`, { amount });

// Analytics
export const getExpenseAnalytics = (startDate, endDate) => 
  api.get('/analytics/expenses', { params: { startDate, endDate } });

// Dashboard API calls
export const getDashboardStats = () => api.get('/dashboard/stats');
export const markBillAsPaidDashboard = (billId) => api.patch(`/dashboard/bills/${billId}/pay`);
export const updateGoalProgressDashboard = (goalId, amount) => api.patch(`/dashboard/goals/${goalId}/progress`, { amount });

export default api;
