"use client";
import { Button, TextInput } from "@mantine/core";
import { makeBrowserClient } from "@/utils/supabase/client";
import { useRef } from "react";

// username 받아서 DB INSERT

const AuthConfirmComponent = ({ searchParams }: { searchParams: { confirmUrl: string } }) => {
  const usernameRef = useRef<HTMLInputElement>(null);
  const supabase = makeBrowserClient();

  // const supabase = createClient();

  const usernameHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const username = usernameRef.current!.value;
    // DB INSERT
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert({ username })
      // .eq('id', userid)
      .select();
    if (insertError) {
      console.error("username DB 추가 에러:", insertError.message);
      return;
    }

    console.log(insertData);
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
      <Button component="a" href={searchParams.confirmUrl} onClick={usernameHandler}>
        Click Here to confirm
      </Button>
    </>
  );
};
export default AuthConfirmComponent;
