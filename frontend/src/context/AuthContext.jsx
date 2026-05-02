import { useEffect, useState } from 'react';
import api from '../api';
import { AuthContext } from './auth-context';
import { reportClientError } from '../utils/logger';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          reportClientError('Failed to fetch user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    
    // API returns user format that we can use, but calling /me ensures consistency
    try {
      const { data: meData } = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${data.token}` }
      });
      localStorage.setItem('user', JSON.stringify(meData));
      setUser(meData);
      return meData;
    } catch {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
