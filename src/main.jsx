import React, { createContext, useContext, useState, useEffect } from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./Routes/Routes.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import useAxiosPublic from "./hooks/useAxiosPublic.jsx";

axios.defaults.withCredentials = true;

const queryClient = new QueryClient();

// --- Auth Context ---
const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  const axiosPublic = useAxiosPublic();
  // Login function
  const login = async (email, password) => {
    const res = await axiosPublic.post("/login", {
      email,
      password,
    });
    const userData = res.data?.user;

    if (userData?.name && userData?.email && userData?.role) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  // Register function
  const register = async (name, email, password) => {
    await axiosPublic.post("/register", {
      name,
      email,
      password,
    });
    return login(email, password);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook
export function useAuth() {
  return useContext(AuthContext);
}

// --- App Entry ---
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div data-theme="light" className="max-w-7xl mx-auto">
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
