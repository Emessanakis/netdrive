import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  picture?: string;
  planId?: number | null;
  planName?: string | null;
  storageLimitBytes: number;
  status: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Restore user session from backend cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data?.status === "Success" && data?.user) {
          const u = data.user;
          setUser({
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            role: u.roles?.[0] || "user",
            picture: u.picture,
            planId: u.plan?.id ?? null,
            planName: u.plan?.name ?? null,
            storageLimitBytes:
              u.plan?.storage_limit_bytes ?? u.storageLimitBytes ?? 0,
            status: u.status ?? true,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Optional: call backend signout endpoint
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/signout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
