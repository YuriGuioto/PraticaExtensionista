import { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children }: PropsWithChildren): JSX.Element => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
