import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { setAccessToken, logoutUser } from "../utils/auth";
import axios from "axios";
import { authActions } from "../redux/store";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    let parsed;
    try {
      parsed = JSON.parse(storedUser);
    } catch {
      // Corrupt localStorage entry — ignore.
      return;
    }
    // Optimistically show the cached profile so the shell renders instantly.
    setUser(parsed);
    setIsLoggedIn(true);

    // Sync the cached profile with the server. A role change made AFTER
    // this user logged in (e.g. an Admin promoting Reader → Writer) is stored
    // only in the DB; the localStorage copy keeps the stale role until a fresh
    // login. That made CreateBlog's "Only Writers can create blogs" gate fire
    // for a user who IS now a Writer — fixed only by logout + login. Calling
    // /refresh here re-fetches publicUser (with the up-to-date role) + mints a
    // fresh access token, using the httpOnly refresh cookie. We then update
    // localStorage, this context, and the redux store so every consumer
    // (Navbar, Profile, CreateBlog) sees the current role.
    axios
      .post("/api/v1/user/refresh")
      .then(({ data }) => {
        if (!data?.success || !data.user) return;
        const fresh = data.user;
        localStorage.setItem("user", JSON.stringify(fresh));
        localStorage.setItem("userId", fresh._id);
        localStorage.setItem("userRole", fresh.role);
        localStorage.setItem("isLogin", "true");
        if (data.accessToken) setAccessToken(data.accessToken);
        setUser(fresh);
        setIsLoggedIn(true);
        dispatch(authActions.login(fresh));
      })
      .catch((err) => {
        // Only an explicit auth failure (401) means the session is really
        // dead — clear the stale local user so protected UI never trusts a
        // cached role/identity. A transient network or 5xx error must NOT log
        // the user out; keep the cached profile and let a real 401 surface
        // later via the axios interceptor.
        if (err?.response?.status !== 401) return;
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("isLogin");
        setUser(null);
        setIsLoggedIn(false);
        dispatch(authActions.logout());
      });
  }, [dispatch]);

  // userData is the safe user object from the API; accessToken is the
  // short-lived JWT. The refresh token is already an httpOnly cookie.
  const login = (userData, accessToken) => {
    if (accessToken) setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userId", userData._id);
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("isLogin", "true");
    setUser(userData);
    setIsLoggedIn(true);
    dispatch(authActions.login(userData));
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      // Firebase sign-out failure shouldn't block local logout.
      console.error("Firebase signOut error:", error);
    }
    await logoutUser(); // clears the server refresh cookie + local auth state
    setUser(null);
    setIsLoggedIn(false);
    dispatch(authActions.logout());
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);