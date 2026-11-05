
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user when the website is refreshed.
  useEffect(() => {
    const token = localStorage.getItem("pft_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/profile")
      .then(({ data }) => {
        setUser(data.user ?? data);
      })
      .catch(() => {
        localStorage.removeItem("pft_token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login and registration.
  const authenticate = async (endpoint, credentials) => {
    const { data } = await api.post(endpoint, credentials);

    if (!data.token) {
      throw new Error("Authentication token was not returned by the server.");
    }

    localStorage.setItem("pft_token", data.token);
    setUser(data.user ?? null);
  };

  const login = (credentials) =>
    authenticate("/auth/login", credentials);

  const register = (credentials) =>
    authenticate("/auth/register", credentials);

  // Logout.
  const logout = () => {
    localStorage.removeItem("pft_token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
