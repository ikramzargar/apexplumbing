'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, loginDistributor, getMe } from '@/lib/auth.api';
import { usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initAttempted, setInitAttempted] = useState(false);

  useEffect(() => {
    // Skip auth initialization on public routes to prevent redirect loops
    const publicRoutes = ['/login'];
    if (publicRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      if (initAttempted) return;
      setInitAttempted(true);

      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
              setLoading(false);
              return;
            } catch {
              // storedUser corrupt, try API
            }
          }
          try {
            const response = await getMe();
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } catch {
            // Token invalid or API failed — don't remove token, keep user as stored
            if (!localStorage.getItem('user')) {
              localStorage.removeItem('token');
              setToken(null);
            }
          }
        }
        setLoading(false);
      }
    };

    initAuth();
  }, [pathname, initAttempted]);

  const login = async (email, password) => {
    const result = await loginUser(email, password);
    const { token, user } = result.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return { ...result, data: { token, user } };
  };

  const loginDist = async (username, password) => {
    const result = await loginDistributor(username, password);
    const { token, user } = result.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    return { ...result, data: { token, user } };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setInitAttempted(false);
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isStaff = user?.role === 'staff';
  const isDistributor = user?.role === 'distributor';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginDist,
      logout,
      isSuperAdmin,
      isAdmin,
      isStaff,
      isDistributor
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}