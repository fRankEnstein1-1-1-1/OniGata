import { setToken, removeToken } from './jwt';

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
  setToken(data.token); // add this line
  return data;
};

export const logout = () => {
  removeToken();
};
