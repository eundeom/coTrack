"use client";

import { Button, TextInput } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserState } from "@/app/context/user.provider";

const UserInfoPage = () => {
  const { userId } = useUserState();
  const usernameRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const router = useRouter();

  const usernameHandler = async () => {
    const username = usernameRef.current!.value;
    // DB INSERT
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert({ username })
      .eq("id", userId as string)
      .select();
    if (insertError) {
      console.error("username DB insert error: ", insertError.message);
      return;
    }
    router.push("/playlist/main");
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
