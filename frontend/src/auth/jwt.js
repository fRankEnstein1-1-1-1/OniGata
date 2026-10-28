// Utility for handling JWT tokens in local storage

const TOKEN_KEY = 'auth_token';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  // Optional: check if token is expired
  const decoded = parseJwt(token);
  if (decoded && decoded.exp) {
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      removeToken();
      return false;
    }
  }
  return true;
};
