import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  const login = async (inputs) => {
    const res = await axios.post(
      "https://realestate-api-yb05.onrender.com/api/auth/login",
      inputs,
      { withCredentials: true }
    );
    setCurrentUser(res.data);
  };

  const logout = async () => {
    await axios.post(
      "https://realestate-api-yb05.onrender.com/api/auth/logout",
      {},
      { withCredentials: true }
    );
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
