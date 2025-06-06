import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_URL as string;

// Define the shape of the context value
export interface AuthContextType {
  user: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  loginUser: (username: string, password: string) => void;
  logoutUser: () => void;
  isLoggedIn: () => boolean;
}

// Create the context with undefined initial value to enforce provider usage
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cacheUser = localStorage.getItem("user");
    const cacheAccessToken = localStorage.getItem("accessToken");
    const cacheRefreshToken = localStorage.getItem("refreshToken");
    if (cacheUser && cacheAccessToken && cacheRefreshToken) {
      setUser(cacheUser);
      setAccessToken(cacheAccessToken);
      setRefreshToken(cacheRefreshToken);
    }
  }, []);

  const isLoggedIn = (): boolean => {
    return !!(user && accessToken && refreshToken);
  };

  const loginUser = (username: string, password: string): void => {
    fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
      .then(response => {
        response.json().then(data => {
          if (!response.ok) {
            alert(data.error);
            return;
          }
          setUser(data.username);
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);
          localStorage.setItem("user", data.username);
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          navigate("/");
        });
      })
      .catch(error => {
        console.error('Error: ', error);
      });
  };

  const logoutUser = (): void => {
    fetch(`${baseUrl}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(response => {
        response.json().then(data => {
          if (!response.ok) {
            alert(data.error);
            return;
          }
          setUser(null);
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/");
        }).catch(error => {
          console.error('Error: ', error);
        });
      });
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, loginUser, logoutUser, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
