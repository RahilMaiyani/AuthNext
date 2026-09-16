"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setAccessToken } from "@/lib/axios";
import { IUser, AuthContextType } from "@/lib/globalTypes";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const res = await api.post("/auth/refresh");

        const { accessToken, user }: { accessToken: string; user: IUser } =
          res.data;

        setAccessToken(accessToken);
        setUser(user);
      } catch (error) {
        console.log("No active session found.");
      } finally {
        setIsLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const router = useRouter();

  const login = (token: string, userData: IUser) => {
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      setAccessToken(null);
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
