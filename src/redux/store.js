import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './slices/transactionsSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    auth: authReducer,
  },
});

export default store;
