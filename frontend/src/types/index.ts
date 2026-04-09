// Auth
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  project_id?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Admin
export interface Project {
  id: string;
  name: string;
  description?: string;
  os_project_id?: string;
  enabled: boolean;
  created_at: string;
}

export interface Quota {
  project_id: string;
  instances: number;
  vcpus: number;
  ram: number;
  volumes: number;
  gigabytes: number;
  floating_ips: number;
  networks: number;
  security_groups: number;
}

export interface AuditEvent {
  id: string;
  user_id: string;
  username: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  status: string;
  ip_address?: string;
  created_at: string;
}

// Cloud
export interface Instance {
  id: string;
  name: string;
  status: string;
  flavor?: { vcpus: number; ram: number; disk: number; name: string };
  addresses?: Record<string, { addr: string; version: number }[]>;
  image?: { id: string; name?: string };
  key_name?: string;
  created: string;
}

export interface Flavor {
  id: string;
  name: string;
  vcpus: number;
  ram: number;
  disk: number;
}

export interface Network {
  id: string;
  name: string;
  status: string;
  admin_state_up: boolean;
  shared: boolean;
}

export interface Volume {
  id: string;
  name?: string;
  size: number;
  status: string;
  volume_type?: string;
  created_at: string;
}

export interface FloatingIp {
  id: string;
  floating_ip_address: string;
  fixed_ip_address?: string;
  status: string;
}

// Billing
export interface Customer {
  id: string;
  project_id: string;
  company_name: string;
  contact_email: string;
  plan_type: 'basic' | 'standard' | 'enterprise';
  credit_balance: number;
  status: 'active' | 'suspended' | 'cancelled';
  created_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  company_name?: string;
  project_id?: string;
  billing_period_start: string;
  billing_period_end: string;
  subtotal: number;
  discount: number;
  amount: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'void';
  due_date?: string;
  items: InvoiceItem[];
  created_at: string;
}

export interface InvoiceItem {
  resource_type: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_cost: number;
}

// Common
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
