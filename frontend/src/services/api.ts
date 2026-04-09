import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh-token', { refreshToken });
          localStorage.setItem('token', data.accessToken);
          err.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  profile: () => api.get('/auth/profile'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getUsers: (params?: object) => api.get('/auth/users', { params }),
  createUser: (data: object) => api.post('/auth/register', data),
  updateUser: (id: string, data: object) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/auth/users/${id}`),
};

// Admin
export const adminApi = {
  getProjects: (params?: object) => api.get('/admin/projects', { params }),
  createProject: (data: object) => api.post('/admin/projects', data),
  getProject: (id: string) => api.get(`/admin/projects/${id}`),
  updateProject: (id: string, data: object) => api.put(`/admin/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/admin/projects/${id}`),
  getQuota: (projectId: string) => api.get(`/admin/quotas/${projectId}`),
  updateQuota: (projectId: string, data: object) => api.put(`/admin/quotas/${projectId}`, data),
  getAuditLogs: (params?: object) => api.get('/admin/audit', { params }),
};

// Cloud
export const cloudApi = {
  getInstances: () => api.get('/cloud/instances'),
  createInstance: (data: object) => api.post('/cloud/instances', data),
  deleteInstance: (id: string) => api.delete(`/cloud/instances/${id}`),
  instanceAction: (id: string, action: string, params?: object) =>
    api.post(`/cloud/instances/${id}/action`, { action, ...params }),
  getFlavors: () => api.get('/cloud/flavors'),
  getNetworks: () => api.get('/cloud/networks'),
  createNetwork: (data: object) => api.post('/cloud/networks', data),
  deleteNetwork: (id: string) => api.delete(`/cloud/networks/${id}`),
  getFloatingIps: () => api.get('/cloud/floating-ips'),
  allocateFloatingIp: (data: object) => api.post('/cloud/floating-ips', data),
  releaseFloatingIp: (id: string) => api.delete(`/cloud/floating-ips/${id}`),
  getVolumes: () => api.get('/cloud/volumes'),
  createVolume: (data: object) => api.post('/cloud/volumes', data),
  deleteVolume: (id: string) => api.delete(`/cloud/volumes/${id}`),
  getImages: () => api.get('/cloud/images'),
};

// Billing
export const billingApi = {
  getCustomers: (params?: object) => api.get('/billing/customers', { params }),
  createCustomer: (data: object) => api.post('/billing/customers', data),
  getCustomer: (id: string) => api.get(`/billing/customers/${id}`),
  updateCustomer: (id: string, data: object) => api.put(`/billing/customers/${id}`, data),
  getInvoices: (params?: object) => api.get('/billing/invoices', { params }),
  getInvoice: (id: string) => api.get(`/billing/invoices/${id}`),
  generateInvoice: (customerId: string) =>
    api.post('/billing/invoices/generate', { customer_id: customerId }),
  payInvoice: (id: string) => api.post(`/billing/invoices/${id}/pay`),
  updateInvoiceStatus: (id: string, status: string) =>
    api.put(`/billing/invoices/${id}/status`, { status }),
  getUsageSummary: (customerId: string, start: string, end: string) =>
    api.get('/billing/usage/summary', { params: { customer_id: customerId, start, end } }),
};

export default api;
