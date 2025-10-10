import { createContext, useState, useEffect } from "react";
import API from "../utils/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const registerUser = async (data) => {
    const res = await API.post("/api/auth/register", data);
    setUser(res.data.user);
    return res.data.user;
  };

  const loginUser = async (data) => {
    const res = await API.post("/api/auth/login", data);
    setUser(res.data.user);
    return res.data.user;
  };

  const logoutUser = async () => {
    await API.post("/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, registerUser, loginUser, logout: logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
