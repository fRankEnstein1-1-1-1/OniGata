import { setToken, removeToken, getToken } from './jwt';

const API_URL = 'http://localhost:5000/api/auth';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  setToken(data.token);
  if (data.name) {
    localStorage.setItem('user_name', data.name);
  } else if (data.user?.name) {
    localStorage.setItem('user_name', data.user.name);
  }
  return data;
};

export const signup = async (name, email, password) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }
  setToken(data.token);
  localStorage.setItem('user_name', data.name || name);
  return data;
};

export const getMe = async () => {
  try {
    const token = getToken();
    if (!token) return null;
    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.user?.name) {
      localStorage.setItem('user_name', data.user.name);
    }
    return data.user;
  } catch {
    return null;
  }
};

export const logout = () => {
  removeToken();
  localStorage.removeItem('user_name');
};
