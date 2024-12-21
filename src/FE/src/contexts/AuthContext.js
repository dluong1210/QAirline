import React, { createContext, useContext, useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../services/api";

export const AuthState = {
  LOADING: "loading",
  VERIFIED: "verified",
  UNAUTHORIZED: "unauthorized",
  ELEVATED: "elevated",
  SERVER_ERROR: "server_error",
  SERVER_UNAVAILABLE: "server_unavailable",
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check sessionStorage for existing user data when component mounts
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authStatus, setAuthStatus] = useState(AuthState.LOADING);

  // Update sessionStorage whenever user state changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  // Try to verify credentials on mount
  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      setAuthStatus(AuthState.LOADING);
      const response = await fetch(`${BACKEND_BASE_URL}/auth/verify`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        try {
          const verifyAdmin = await fetch(
            `${BACKEND_BASE_URL}/auth/verifyAdmin`,
            {
              method: "POST",
              credentials: "include",
            }
          );

          if (!verifyAdmin.ok) {
            console.log(
              `Verified failed: ${(await verifyAdmin.json()).message}`
            );
            return;
          }

          const adminUserData = await verifyAdmin.json();
          setUser(adminUserData);
          setAuthStatus(AuthState.ELEVATED);
          return;
        } catch (error) {
          if (error instanceof TypeError) {
            setAuthStatus(AuthState.SERVER_UNAVAILABLE);
          } else {
            console.error(error);
            setAuthStatus(AuthState.SERVER_ERROR);
          }
        }

        console.log(`Verified failed: ${(await response.json()).message}`);
        return;
      }
      const data = await response.json();
      setUser(data);
      setAuthStatus(AuthState.VERIFIED);
    } catch (error) {
      if (error instanceof TypeError) {
        setAuthStatus(AuthState.SERVER_UNAVAILABLE);
      } else {
        console.error(error);
        setAuthStatus(AuthState.SERVER_ERROR);
      }
    }
  };

  const login = (userData) => {
    setAuthStatus(AuthState.VERIFIED);
    setUser(userData);
  };

  const logout = async () => {
    try {
      setUser(null);
      setAuthStatus(AuthState.LOADING);
      const response = await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status == 500) {
        console.error(await response.text());
        setAuthStatus(AuthState.SERVER_ERROR);
        return false;
      }

      // Successfully logged out
      setAuthStatus(AuthState.UNAUTHORIZED);
      return true;
    } catch (error) {
      if (error instanceof TypeError) {
        setAuthStatus(AuthState.SERVER_UNAVAILABLE);
      } else {
        console.error(error);
        setAuthStatus(AuthState.SERVER_ERROR);
      }
      return false;
    }
  };

  const value = {
    user,
    login,
    logout,
    authStatus,
    verifyAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}