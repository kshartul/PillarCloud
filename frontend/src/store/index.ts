import { configureStore } from '@reduxjs/toolkit';
import authReducer   from './slices/authSlice';
import adminReducer  from './slices/adminSlice';
import cloudReducer  from './slices/cloudSlice';
import billingReducer from './slices/billingSlice';

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    admin:   adminReducer,
    cloud:   cloudReducer,
    billing: billingReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
