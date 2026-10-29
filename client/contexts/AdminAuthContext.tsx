import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AdminProfile {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff";
}

interface AdminAuthContextType {
  token: string | null;
  admin: AdminProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, admin: AdminProfile) => void;
  logout: () => void;
  updateAdmin: (admin: AdminProfile) => void;
  authHeader: Record<string, string>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_KEY = "rhy_admin_token";
const USER_KEY = "rhy_admin_user";

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminProfile | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const login = useCallback((newToken: string, newAdmin: AdminProfile) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
  }, []);

  const updateAdmin = useCallback((updated: AdminProfile) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setAdmin(updated);
  }, []);

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.admin) {
            setAdmin({
              id: json.admin._id || json.admin.id,
              username: json.admin.username,
              email: json.admin.email,
              role: json.admin.role,
            });
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch {
        // Network failure — preserve cached login
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated: !!token && !!admin,
        isLoading,
        login,
        logout,
        updateAdmin,
        authHeader,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
