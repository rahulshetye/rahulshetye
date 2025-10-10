import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://rahulshetye.onrender.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // --- Register user ---
  const registerUser = async (data) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw result;
      // Save token
      localStorage.setItem("token", result.token);
      setUser(result.user);
      return result;
    } catch (err) {
      throw err;
    }
  };

  // --- Login user ---
  const loginUser = async (data) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw result;

      // Save token for future requests
      localStorage.setItem("token", result.token);
      setUser(result.user);
      return result;
    } catch (err) {
      throw err;
    }
  };

  // --- Logout user ---
  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // --- Fetch user profile on mount ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setUser(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) setUser(data.user);
        else setUser(null);
      } catch {
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        registerUser,
        loginUser,
        logout: logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
