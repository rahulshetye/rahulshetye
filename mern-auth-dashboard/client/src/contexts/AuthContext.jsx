import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

const BACKEND_URL = "https://rahulshetye.onrender.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // --- Register ---
  const registerUser = async (data) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
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

  // --- Login ---
  const loginUser = async (data) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
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

  // --- Logout ---
  const logoutUser = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null); // Clear user state
      window.location.href = "/login"; // Redirect to login page
    }
  };

  // --- Fetch profile on mount ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/me`, {
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
        logout: logoutUser, // use consistent logout naming
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
