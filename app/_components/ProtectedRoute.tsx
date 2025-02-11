import { ReactNode } from 'react';
import { useAuth } from '../_lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
}

export default function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { hasPermission } = useAuth();
  const router = useRouter();

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Redirigir a una página de acceso denegado o al dashboard según el rol
    router.push('/dashboard');
    return null;
  }

  return <>{children}</>;
} 