"use client";
import { createClient } from "@/utils/supabase/client";
import { TextInput, Button, PasswordInput, Center } from "@mantine/core";
import Link from "next/link";
import { useRef } from "react";
import "../auth.css";
import { useUserState } from "@/app/context/user.provider";

const LoginPage = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useUserState();

  const supabase = createClient();

  const LoginHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const email = emailRef.current!.value.trim();
    const password = passwordRef.current!.value.trim();
    if (!email || !password) return;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (data.user) {
        setUser(true);

        fetch("/api/spotify", { method: "POST" })
          .then((res) => res.json())
          .then((url) => location.replace(url));
      } else {
        alert("log in failed");
      }
    } catch (error) {
      console.error(error);
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
        {/* <Text size="xl">Log in</Text> */}
        <h1 className="auth-main-title">
          {/* ✳︎
          <br /> */}
          Log in to{" "}
          <span>
            c<span style={{ fontSize: 40, color: "#fb00a3" }}>✳︎</span>
          </span>
          Track
        </h1>
        <form onSubmit={LoginHandler}>
          <TextInput
            // label="Email"
            placeholder="E-mail"
            radius="xl"
            size="md"
            w={300}
            ref={emailRef}
          />
          <PasswordInput
            // label="Password"
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
            // color="#fb00a3"
          >
            log in
          </Button>

          {/* redirect to sign up page */}
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
