import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');

      if (savedToken) {
        try {
          const decoded = decodeJWT(savedToken);
          if (decoded && decoded.exp * 1000 > Date.now()) {
            setToken(savedToken);
            setUser({
              id: decoded.sub,
              email: decoded.email,
              username: decoded.username || decoded.email.split('@')[0],
            });
          } else {
            console.warn('Token expired or invalid:', decoded);
            localStorage.removeItem('auth_token');
            navigate('/auth');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('auth_token');
          navigate('/auth');
        }
      } else {
        console.error('No saved token found');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [navigate]);

  const login = (newToken: string) => {
    try {
      const decoded = decodeJWT(newToken);
      if (!decoded) {
        throw new Error('Invalid token');
      }
      if (decoded.exp * 1000 < Date.now()) {
        console.warn('Token already expired:', decoded);
        throw new Error('Token already expired');
      }

      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser({
        id: decoded.sub,
        email: decoded.email,
        username: decoded.username || decoded.email.split('@')[0],
      });
      navigate('/chat');
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid token');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('selectedRoomId');
    setToken(null);
    setUser(null);
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};