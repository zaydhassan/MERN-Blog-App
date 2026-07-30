import { createContext, useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { setAccessToken, logoutUser } from "../utils/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch {
        // Corrupt localStorage entry — ignore.
      }
    }
  }, []);

  // userData is the safe user object from the API; accessToken is the
  // short-lived JWT. The refresh token is already an httpOnly cookie.
  const login = (userData, accessToken) => {
    if (accessToken) setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userId", userData._id);
    localStorage.setItem("userRole", userData.role);
    setUser(userData);
    setIsLoggedIn(true);
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
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);