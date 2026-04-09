import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import type { AuthState } from '../../types';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await authApi.login(username, password);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.error || 'Login failed');
    }
  }
);

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.profile();
    return data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error || 'Failed to fetch profile');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.clear();
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending,   s => { s.loading = true;  s.error = null; })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        s.token = a.payload.accessToken;
        s.refreshToken = a.payload.refreshToken;
        s.user = a.payload.user;
        localStorage.setItem('token', a.payload.accessToken);
        localStorage.setItem('refreshToken', a.payload.refreshToken);
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.user = a.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
