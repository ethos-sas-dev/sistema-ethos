'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'jefeOperativo' | 'administrador' | 'directorio' | 'propietario' | 'arrendatario';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Definición de permisos por rol
const rolePermissions: Record<UserRole, string[]> = {
  jefeOperativo: ['view_basic', 'manage_properties', 'manage_documents'],
  administrador: ['view_basic', 'manage_properties', 'manage_documents', 'manage_users', 'view_finances'],
  directorio: ['view_basic', 'manage_properties', 'manage_documents', 'manage_users', 'view_finances', 'manage_company'],
  propietario: ['view_own_properties', 'view_own_documents'],
  arrendatario: ['view_rented_property', 'view_own_documents']
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('jefeOperativo');

  const hasPermission = (permission: string) => {
    return rolePermissions[role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ role, setRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 