import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { billingApi } from '../../services/api';
import type { Customer, Invoice, PaginatedResponse } from '../../types';

interface BillingState {
  customers: PaginatedResponse<Customer> | null;
  invoices: PaginatedResponse<Invoice> | null;
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  customers: null, invoices: null, loading: false, error: null,
};

export const fetchCustomers = createAsyncThunk('billing/fetchCustomers', async (params?: object) => {
  const { data } = await billingApi.getCustomers(params);
  return data;
});

export const fetchInvoices = createAsyncThunk('billing/fetchInvoices', async (params?: object) => {
  const { data } = await billingApi.getInvoices(params);
  return data;
});

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchCustomers.pending,   s => { s.loading = true; })
      .addCase(fetchCustomers.fulfilled, (s, a) => { s.loading = false; s.customers = a.payload; })
      .addCase(fetchCustomers.rejected,  (s, a) => { s.loading = false; s.error = a.error.message || null; })
      .addCase(fetchInvoices.fulfilled,  (s, a) => { s.invoices = a.payload; });
  },
});

export const { clearError } = billingSlice.actions;
export default billingSlice.reducer;
