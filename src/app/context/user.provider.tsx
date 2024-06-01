"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

interface UserContextType {
  user: boolean;
  userId: string | null;
  setUser: React.Dispatch<React.SetStateAction<boolean>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const UserStateContext = createContext<UserContextType | undefined>(undefined);

export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkCredential = async () => {
      try {
        const response = await fetch("/api/auth/checkCredential", {
          method: "POST",
        });
        if (response.ok) {
          const data = await response.json();
          setUserId(data);
          setUser(true);
        } else {
          setUserId(null);
          setUser(false);
        }
      } catch (error) {
        console.error("Error checking credentials:", error);

        setUserId(null);
        setUser(false);
      }
    };
    checkCredential();
  }, []);

  return (
    <UserStateContext.Provider value={{ user, userId, setUser, setUserId }}>
      {children}
    </UserStateContext.Provider>
  );
};
