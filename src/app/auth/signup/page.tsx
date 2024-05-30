"use client";
import { TextInput, Group, Button, PasswordInput } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import { useRef } from "react";
import Link from "next/link";

const SignUpPage = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const signupHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const email = emailRef.current!.value;
    const password = passwordRef.current!.value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          originUrl: location.origin,
        },
        emailRedirectTo: "http://localhost:3000/auth/userInfo",
      },
    });
    console.log(data.user, "user");

    if (error) {
      console.error("회원가입 에러:", error.message);
      return;
    }

    if (data && confirm("please confirm your email")) {
      const { error } = await supabase.from("users").insert({ username: null });
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
          Sign up to{" "}
          <span>
            c<span style={{ fontSize: 40, color: "#fb00a3" }}>✳︎</span>
            Track{" "}
          </span>
        </h1>
        <form onSubmit={signupHandler}>
          <TextInput
            placeholder="E-mail"
            w={300}
            m={10}
            radius="xl"
            size="md"
            withAsterisk
            ref={emailRef}
          />
          <PasswordInput
            placeholder="Password"
            w={300}
            m={10}
            radius="xl"
            size="md"
            withAsterisk
            ref={passwordRef}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              type="submit"
              w={300}
              m={10}
              radius="xl"
              size="md"
              color="rgba(122, 122, 122, 1)"
            >
              sign up
            </Button>
          </Group>
        </form>

        <p>
          Do you have an account?{" "}
          <Link href="/" className="auth-subtitle">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
};
export default SignUpPage;
