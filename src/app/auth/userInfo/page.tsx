"use client";

import { Button, TextInput } from "@mantine/core";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserState } from "@/app/context/user.provider";

const UserInfoPage = () => {
  const { userId } = useUserState();
  const usernameRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const usernameHandler = async () => {
    const username = usernameRef.current!.value;

    // DB INSERT
    const insertUsernameResponse = await fetch("/api/user/insertUsername", {
      method: "POST",
      body: JSON.stringify({ username, userId }),
    });

    const insertUsernameResult = insertUsernameResponse.json();
    if (insertUsernameResponse.ok) {
      router.push("/playlist/main");
    }
  };

  return (
    <>
      <TextInput
        label="User name"
        placeholder="username"
        w={300}
        m={10}
        withAsterisk
        ref={usernameRef}
      />
      <Button onClick={usernameHandler}>set user name</Button>
    </>
  );
};

export default UserInfoPage;
