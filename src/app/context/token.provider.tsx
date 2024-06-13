"use client";
import { DateTime } from "luxon";
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from "react";
import { useUserState } from "./user.provider";

type TokenContextType = {
  getAccessToken: () => Promise<string>;
};

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
  const { user } = useUserState();
  const tokenRef = useRef<TokenRef>();

  const tokenInitializedRef = useRef<boolean>(false);
  const tokenInitializingRef = useRef<boolean>(false);

  const getToken = useCallback(async () => {
    tokenInitializedRef.current = false;
    if (!user) {
      tokenInitializingRef.current = false;
      return;
    }

    tokenInitializingRef.current = true;
    console.log("initializing..");
    const response = await fetch("/api/token/getAccessToken", {
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      tokenRef.current = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expireAt: DateTime.fromISO(data.expire_at),
      };
      tokenInitializingRef.current = false;
      tokenInitializedRef.current = true;
      console.log("initialized");
    }
  }, [user]);

  const waiteUntilTokenInitialized = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      let count = 0;
      const interval = setInterval(() => {
        if (tokenInitializedRef.current) {
          clearInterval(interval);
          return resolve();
        }
        if (count > 1000) {
          clearInterval(interval);
          return reject();
        }
        count++;
      }, 60);
    });
  }, []);

  const getAccessToken = useCallback(async () => {
    if (!tokenInitializedRef.current) {
      if (tokenInitializingRef.current) {
        await waiteUntilTokenInitialized();
      } else {
        await getToken();
      }
    }

    const token = tokenRef.current!;

    if (token.expireAt > DateTime.now()) {
      return token.accessToken;
    }

    tokenInitializedRef.current = false;
    tokenInitializingRef.current = true;
    const res = await fetch("/api/token/refreshToken", { method: "post" });
    const data = await res.json();

    tokenRef.current = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expireAt: DateTime.fromISO(data.expire_at),
    };
    tokenInitializingRef.current = false;
    tokenInitializedRef.current = true;

    return data.access_token;
  }, [getToken, waiteUntilTokenInitialized]);

  return (
    <TokenStateContext.Provider value={{ getAccessToken }}>{children}</TokenStateContext.Provider>
  );
};
