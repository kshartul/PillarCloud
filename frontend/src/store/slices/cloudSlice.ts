import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cloudApi } from '../../services/api';
import type { Instance, Flavor, Network, Volume, FloatingIp } from '../../types';

interface CloudState {
  instances: Instance[];
  flavors: Flavor[];
  networks: Network[];
  volumes: Volume[];
  floatingIps: FloatingIp[];
  loading: boolean;
  error: string | null;
}

const initialState: CloudState = {
  instances: [], flavors: [], networks: [], volumes: [], floatingIps: [],
  loading: false, error: null,
};

export const fetchInstances  = createAsyncThunk('cloud/fetchInstances',  async () => (await cloudApi.getInstances()).data);
export const fetchFlavors    = createAsyncThunk('cloud/fetchFlavors',    async () => (await cloudApi.getFlavors()).data);
export const fetchNetworks   = createAsyncThunk('cloud/fetchNetworks',   async () => (await cloudApi.getNetworks()).data);
export const fetchVolumes    = createAsyncThunk('cloud/fetchVolumes',    async () => (await cloudApi.getVolumes()).data);
export const fetchFloatingIps = createAsyncThunk('cloud/fetchFloatingIps', async () => (await cloudApi.getFloatingIps()).data);

const cloudSlice = createSlice({
  name: 'cloud',
  initialState,
  reducers: { clearError: s => { s.error = null; } },
  extraReducers: builder => {
    builder
      .addCase(fetchInstances.pending,    s => { s.loading = true; })
      .addCase(fetchInstances.fulfilled,  (s, a) => { s.loading = false; s.instances  = a.payload; })
      .addCase(fetchInstances.rejected,   (s, a) => { s.loading = false; s.error = a.error.message || null; })
      .addCase(fetchFlavors.fulfilled,    (s, a) => { s.flavors    = a.payload; })
      .addCase(fetchNetworks.fulfilled,   (s, a) => { s.networks   = a.payload; })
      .addCase(fetchVolumes.fulfilled,    (s, a) => { s.volumes    = a.payload; })
      .addCase(fetchFloatingIps.fulfilled,(s, a) => { s.floatingIps = a.payload; });
  },
});

export const { clearError } = cloudSlice.actions;
export default cloudSlice.reducer;
