'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'cashier';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Store token and user in localStorage
export const authStorage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },
};

// Custom hook to check authentication
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    const token = authStorage.getToken();

    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, loading, isAuthenticated, logout };
};

// Protected route hook
export const useProtectedRoute = (requiredRole?: string | string[]) => {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredRole && user) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.role)) {
          router.push('/dashboard');
        }
      }
    }
  }, [isAuthenticated, loading, router, user, requiredRole]);

  return { isLoading: loading };
};
