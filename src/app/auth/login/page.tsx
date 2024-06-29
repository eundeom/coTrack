"use client";
import { makeBrowserClient } from "@/utils/supabase/client";
import { TextInput, Button, PasswordInput } from "@mantine/core";
import Link from "next/link";
import { useRef } from "react";
import "../auth.css";
import { useUserState } from "@/app/context/user.provider";

const LoginPage = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { setUser, setUserId, userId } = useUserState();

  const LoginHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const email = emailRef.current!.value.trim();
    const password = passwordRef.current!.value.trim();
    if (!email || !password) return;

    const authSupabase = makeBrowserClient();

    const { data, error } = await authSupabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      setUser(true);
      setUserId(data.user.id);

      const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
      const redirect_uri = `${window.location.origin}/api/spotify`;
      // const SCOPE = "user-read-private user-read-email";
      const SCOPE = "streaming user-read-email user-read-private";

      const params = new URLSearchParams();
      params.set("response_type", "code");
      params.set("client_id", client_id);
      params.set("scope", SCOPE);
      params.set("redirect_uri", redirect_uri);

      location.replace("https://accounts.spotify.com/authorize?" + params.toString());
    } else {
      alert("log in failed");
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h1 className="auth-main-title">
          Log in to{" "}
          <span>
            c<span style={{ fontSize: 40, color: "#fb00a3" }}>✳︎</span>
          </span>
          Track
        </h1>
        <form onSubmit={LoginHandler}>
          <TextInput placeholder="E-mail" radius="xl" size="md" w={300} ref={emailRef} />
          <PasswordInput
            placeholder="Password"
            radius="xl"
            size="md"
            w={300}
            mt={20}
            ref={passwordRef}
          />

          <Button
            variant="light"
            type="submit"
            w={300}
            mt={20}
            radius="xl"
            size="md"
            color="rgba(122, 122, 122, 1)"
          >
            log in
          </Button>
        </form>

        <Link href="/auth/signup" className="auth-subtitle">
          <p>Create a new account</p>
        </Link>
        <Link href="/" className="auth-subtitle">
          <p>Forgot Password?</p>
        </Link>
      </div>
    </>
  );
};
export default LoginPage;
