import axios from "axios";

// Access token lives in localStorage with a short (15m) server-side expiry;
// the long-lived refresh token lives in an httpOnly cookie the JS can't read.
const ACCESS_TOKEN_KEY = "accessToken";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token) => {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
};

// Clear every auth-related key the legacy code wrote to localStorage.
export const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isLogin");
};

// Full logout: tell the server to clear the refresh cookie, then drop local
// state. Safe to call even if the network call fails.
export const logoutUser = async () => {
  try {
    await axios.post("/api/v1/user/logout");
  } catch {
    // Ignore — we still clear local state below.
  }
  clearAuth();
};