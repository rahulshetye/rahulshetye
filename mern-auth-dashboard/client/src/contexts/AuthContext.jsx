import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://rahulshetye.onrender.com';
console.log("Backend URL:", import.meta.env.VITE_API_URL);



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const registerUser = async (data) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw result;
      setUser(result.user);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const loginUser = async (data) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw result;
      setUser(result.user);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      // window.location.href = "/login"; // optional
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: "include",
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
