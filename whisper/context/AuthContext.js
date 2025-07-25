import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const TOKEN_KEY = "stream-token";
export const API_URL = process.env.EXPO_PUBLIC_SERVER_URL;
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: null,
    user_id: null,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const data = await SecureStore.getItemAsync(TOKEN_KEY);

      if (data) {
        const object = JSON.parse(data);

        //set the context state
        setAuthState({
          token: object.token,
          authenticated: true,
          user_id: object.user._id,
        });
      }
      setInitialized(true);
    };
    loadToken();
  }, []);

  const register = async (username, email, password) => {
    try {
      const result = await fetch(`${API_URL}/api/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const json = await result.json();
      //set the context state
      setAuthState({
        token: json.token,
        authenticated: true,
        user_id: json.user._id,
      });

      //write the JWT to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(json));

      return result;
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await fetch(`${API_URL}/api/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await result.json();
      //set the context state
      setAuthState({
        token: json.token,
        authenticated: true,
        user_id: json.user._id,
      });

      //write the JWT to secure storage
      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(json));

      return result;
    } catch (error) {
      console.log("Login error:", error);
    }
  };

  const logout = async () => {
    //delete token
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    //reset auth state
    setAuthState({ token: null, authenticated: null, user_id: null });
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    authState,
    initialized,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
