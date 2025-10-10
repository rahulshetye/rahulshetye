import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_API_URL || "https://rahulshetye.onrender.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const registerUser = async (data) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;

    localStorage.setItem("token", result.token);
    setUser(result.user);
    return result;
  };

  const loginUser = async (data) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw result;

    localStorage.setItem("token", result.token);
    setUser(result.user);
    return result;
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setUser(null);

      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) return logoutUser();

        const data = await res.json();
        if (res.ok) setUser(data.user);
        else setUser(null);
      } catch {
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, registerUser, loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
