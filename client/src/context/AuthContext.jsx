import { createContext, useEffect, useState } from "react";
import apiRequest from "../lib/apiRequest";

/**
 * Context
 */
export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  /**
   * Persist user to localStorage
   */
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  /**
   * 🔹 MINIMAL ADDITION (THIS FIXES YOUR BUG)
   * Used by Login.jsx
   */
  const updateUser = (data) => {
    setCurrentUser(data);
  };

  /**
   * Login (optional – kept for future use)
   */
  const login = async (inputs) => {
    const res = await apiRequest.post("/auth/login", inputs);
    setCurrentUser(res.data);
  };

  /**
   * Logout
   */
  const logout = async () => {
    await apiRequest.post("/auth/logout");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        updateUser, // ✅ NOW EXISTS
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
