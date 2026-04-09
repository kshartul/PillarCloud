import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/api';
import type { Project, Quota, AuditEvent, PaginatedResponse } from '../../types';

interface AdminState {
  projects: PaginatedResponse<Project> | null;
  selectedQuota: Quota | null;
  auditLogs: PaginatedResponse<AuditEvent> | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  projects: null, selectedQuota: null, auditLogs: null, loading: false, error: null,
};

export const fetchProjects = createAsyncThunk('admin/fetchProjects', async (params?: object) => {
  const { data } = await adminApi.getProjects(params);
  return data;
});

export const fetchAuditLogs = createAsyncThunk('admin/fetchAuditLogs', async (params?: object) => {
  const { data } = await adminApi.getAuditLogs(params);
  return data;
});

export const fetchQuota = createAsyncThunk('admin/fetchQuota', async (projectId: string) => {
  const { data } = await adminApi.getQuota(projectId);
  return data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchProjects.pending,   s => { s.loading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.loading = false; s.projects = a.payload; })
      .addCase(fetchProjects.rejected,  (s, a) => { s.loading = false; s.error = a.error.message || null; })
      .addCase(fetchAuditLogs.fulfilled, (s, a) => { s.auditLogs = a.payload; })
      .addCase(fetchQuota.fulfilled,    (s, a) => { s.selectedQuota = a.payload; });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
