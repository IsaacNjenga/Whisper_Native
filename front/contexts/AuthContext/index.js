import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { storage } from "@/utils/storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/providers/FirebaseProvider";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setUser({ ...user });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    // SecureStore is async, unlike localStorage
    const initAuth = async () => {
      try {
        const storedUser = await storage.getItem("user");
        const storedToken = await storage.getItem("token");

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.warn("Failed to load auth from storage:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  async function login(userData, userToken, userRefreshToken) {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);

    // All SecureStore operations are async
    await storage.setItem("user", JSON.stringify(userData));
    await storage.setItem("token", userToken);
    await storage.setItem("refreshToken", userRefreshToken);
  }

  async function logout() {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    await storage.clear("user", "token", "refreshToken");
  }

  const refreshToken = async () => {
    try {
      const storedRefreshToken = storage.getItem("refreshToken");
      if (!storedRefreshToken) return null;

      const res = await axios.post("refresh-token", {
        refreshToken: storedRefreshToken,
      });

      if (res.data.success) {
        await storage.setItem("token", res.data.token);
        await storage.setItem("refreshToken", res.data.refreshToken);
        setToken(res.data.token);
        return res.data.token;
      }

      return null;
    } catch (error) {
      console.warn("Token refresh failed:", error);
      return null;
    }
  };

  const values = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshToken,
    collapsed,
    setCollapsed,
  };

  return (
    <AuthContext.Provider value={values}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
