"use client";
import { DateTime } from "luxon";
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from "react";
import { useUserState } from "./user.provider";

interface TokenContextType {
  getAccessToken: () => Promise<string>;
  // TODO : remove below
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

type TokenRef = {
  accessToken: string;
  refreshToken: string;
  expireAt: DateTime;
};

export const TokenProvider = ({ children }: { children: any }) => {
  // TODO: remove this
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const { user } = useUserState();
  const tokenRef = useRef<TokenRef>();

  useEffect(() => {
    const getToken = async () => {
      const response = await fetch("/api/token/getAccessToken", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.access_token);
        tokenRef.current = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expireAt: DateTime.fromISO(data.expire_at),
        };
      }
    };
    if (user) getToken();
  }, [user]);

  const getAccessToken = useCallback(async () => {
    const token = tokenRef.current!;

    if (token.expireAt > DateTime.now()) {
      return token.accessToken;
    }

    const res = await fetch("/api/token/refreshToken");
    const data = await res.json();
    tokenRef.current = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expireAt: DateTime.fromISO(data.expire_at),
    };

    return data.access_token;
  }, []);

  return (
    <TokenStateContext.Provider value={{ accessToken, setAccessToken, getAccessToken }}>
      {children}
    </TokenStateContext.Provider>
  );
};
