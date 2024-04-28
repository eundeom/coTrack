"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

interface TokenContextType {
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const TokenStateContext = createContext<TokenContextType | undefined>(undefined);

export const useTokenState = () => {
  const context = useContext(TokenStateContext);
  if (!context) {
    throw new Error("useTokenState must be used within a TokenProvider");
  }
  return context;
};

export const TokenProvider = ({ children }: { children: any }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await fetch("/api/token/getAccessToken", {
          method: "POST",
        });
        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.access_token);
        } else {
          setAccessToken(null);
        }
      } catch (error) {
        console.error("Error checking credentials:", error);

        setAccessToken(null);
      }
    };
    getToken();
  }, []);

  return (
    <TokenStateContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </TokenStateContext.Provider>
  );
};
