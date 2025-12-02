import { Route, Routes } from 'react-router-dom';

import { AdminDashboardPage } from '../pages/AdminDashboardPage.tsx';
import { AdminLoginPage } from '../pages/AdminLoginPage.tsx';
import { ClientLoginPage } from '../pages/ClientLoginPage.tsx';
import { ClientMenuPage } from '../pages/ClientMenuPage.tsx';
import { ClientRegisterPage } from '../pages/ClientRegisterPage.tsx';
import { ProtectedRoute } from '../components/ProtectedRoute.tsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ClientMenuPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/login" element={<ClientLoginPage />} />
      <Route path="/cadastro" element={<ClientRegisterPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
