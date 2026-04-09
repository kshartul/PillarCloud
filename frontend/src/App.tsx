import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { fetchProfile } from './store/slices/authSlice';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UsersPage from './pages/Admin/Users';
import ProjectsPage from './pages/Admin/Projects';
import QuotasPage from './pages/Admin/Quotas';
import AuditPage from './pages/Admin/Audit';
import InstancesPage from './pages/Cloud/Instances';
import NetworksPage from './pages/Cloud/Networks';
import StoragePage from './pages/Cloud/Storage';
import ObjectStoragePage from './pages/Cloud/ObjectStorage';
import OrchestrationPage from './pages/Cloud/Orchestration';
import LoadBalancersPage from './pages/Cloud/LoadBalancers';
import SecretsPage from './pages/Cloud/Secrets';
import DNSPage from './pages/Cloud/DNS';
import SharedFileSystemsPage from './pages/Cloud/SharedFileSystems';
import ContainerInfraPage from './pages/Cloud/ContainerInfra';
import DatabasesPage from './pages/Cloud/Databases';
import DataProcessingPage from './pages/Cloud/DataProcessing';
import BareMetalPage from './pages/Cloud/BareMetal';
import MessagingPage from './pages/Cloud/Messaging';
import TelemetryPage from './pages/Cloud/Telemetry';
import WorkflowsPage from './pages/Cloud/Workflows';
import OptimizationPage from './pages/Cloud/Optimization';
import BillingOverviewPage from './pages/Billing/Overview';
import CustomersPage from './pages/Billing/Customers';
import InvoicesPage from './pages/Billing/Invoices';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useSelector((s: RootState) => s.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchProfile());
  }, [token, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="admin/users"    element={<UsersPage />} />
        <Route path="admin/projects" element={<ProjectsPage />} />
        <Route path="admin/quotas"   element={<QuotasPage />} />
        <Route path="admin/audit"    element={<AuditPage />} />
        <Route path="cloud/instances"      element={<InstancesPage />} />
        <Route path="cloud/networks"       element={<NetworksPage />} />
        <Route path="cloud/storage"        element={<StoragePage />} />
        <Route path="cloud/object-storage" element={<ObjectStoragePage />} />
        <Route path="cloud/orchestration"  element={<OrchestrationPage />} />
        <Route path="cloud/load-balancers" element={<LoadBalancersPage />} />
        <Route path="cloud/secrets"        element={<SecretsPage />} />
        <Route path="cloud/dns"            element={<DNSPage />} />
        <Route path="cloud/shared-fs"      element={<SharedFileSystemsPage />} />
        <Route path="cloud/container-infra" element={<ContainerInfraPage />} />
        <Route path="cloud/databases"      element={<DatabasesPage />} />
        <Route path="cloud/data-processing" element={<DataProcessingPage />} />
        <Route path="cloud/baremetal"      element={<BareMetalPage />} />
        <Route path="cloud/messaging"      element={<MessagingPage />} />
        <Route path="cloud/telemetry"      element={<TelemetryPage />} />
        <Route path="cloud/workflows"      element={<WorkflowsPage />} />
        <Route path="cloud/optimization"   element={<OptimizationPage />} />
        <Route path="billing/overview"  element={<BillingOverviewPage />} />
        <Route path="billing/customers" element={<CustomersPage />} />
        <Route path="billing/invoices"  element={<InvoicesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
