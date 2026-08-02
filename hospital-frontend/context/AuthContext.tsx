'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337/api";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const savedUser = localStorage.getItem('medibook_user');
      const savedToken = localStorage.getItem('medibook_token');
      const savedIsAdmin = localStorage.getItem('medibook_isAdmin');

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setIsAdmin(savedIsAdmin === 'true');
      }
    } catch {
      // Clear corrupt storage if any
      localStorage.removeItem('medibook_user');
      localStorage.removeItem('medibook_token');
      localStorage.removeItem('medibook_isAdmin');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${STRAPI_URL}/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });
      

      const data = await res.json();
      console.log("LOGIN STATUS:", res.status);
console.log("LOGIN DATA:", data);

      if (!res.ok) {
        return { 
          success: false, 
          error: data?.error?.message || 'Invalid email or password.' 
        };
      }

      // Check if user is admin based on Strapi role
      const userRole = data.user?.role?.type || data.user?.role || 'patient';
      const checkIsAdmin = userRole === 'admin';

      const strapiUser: User = {
        id: String(data.user.id),
        documentId: data.user.documentId,
        name: data.user.name || data.user.username,
        email: data.user.email,
        phone: data.user.phone || '',
        dob: data.user.dob || '',
        gender: data.user.gender || '',
        bloodGroup: data.user.bloodGroup || '',
        address: data.user.address || '',
        emergencyContact: data.user.emergencyContact || '',
        role: userRole,
      };

      setUser(strapiUser);
      setToken(data.jwt);
      setIsAdmin(checkIsAdmin);

      localStorage.setItem('medibook_user', JSON.stringify(strapiUser));
      localStorage.setItem('medibook_token', data.jwt);
      localStorage.setItem('medibook_isAdmin', String(checkIsAdmin));

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: 'Unable to connect to the authentication server.' 
      };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${STRAPI_URL}/otp/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.email.split('@')[0],
          email: data.email,
          password: data.password,
          name: data.name,
          phone: data.phone,
          dob: data.dob,
          gender: data.gender,
        }),
      });

      const json = await res.json();
  console.log("Register Response:", json);
    if (!res.ok) {
  console.error("Register Error:", json);

  return {
    success: false,
    error: json?.error?.message || "Registration failed.",
  };
}

      const newUser: User = {
        id: String(json.user.id),
        name: json.user.name || data.name,
        email: json.user.email,
        phone: json.user.phone || data.phone,
        dob: json.user.dob || data.dob,
        gender: json.user.gender || data.gender,
        bloodGroup: json.user.bloodGroup || '',
        address: json.user.address || '',
        emergencyContact: json.user.emergencyContact || '',
        role: 'patient',
      };

      setUser(newUser);
      setToken(json.jwt);
      setIsAdmin(false);

      localStorage.setItem('medibook_user', JSON.stringify(newUser));
      localStorage.setItem('medibook_token', json.jwt);
      localStorage.setItem('medibook_isAdmin', 'false');

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: 'Unable to connect to the server for registration.' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('medibook_user');
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_isAdmin');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('medibook_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}