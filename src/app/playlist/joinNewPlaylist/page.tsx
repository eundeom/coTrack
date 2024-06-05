"use client";
import { Button, Flex, TextInput } from "@mantine/core";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { makeBrowserClient } from "@/utils/supabase/client";
import { useUserState } from "@/app/context/user.provider";

const JoinNewPlaylist = () => {
  const router = useRouter();
  const supabase = makeBrowserClient();
  const inviteCodeRef = useRef<HTMLInputElement>(null);
  const { userId } = useUserState();

  const joinNewPlaylistHandler = () => {};

  const checkPlaylist = async () => {
    const inviteCode = inviteCodeRef.current!.value.trim();

    const { data: expiration_time, error: expiration_error } = await supabase
      .from("playlists")
      .select("*")
      .eq("invite_code", inviteCode);

    console.log(expiration_time![0].code_expiration_time);

    if (expiration_time) {
      // check expiration time
      const currentTime = new Date();

      if (currentTime > expiration_time[0].code_expiration_time) {
        // expired
        alert("This code has been expired!");
      } else {
        const { error: insertError } = await supabase
          .from("playlist_users")
          .insert({ user_id: userId as string, playlist_id: expiration_time![0].id });
        if (insertError) {
          console.error(insertError);
        }
      }
    } else {
      alert("Invalid code.");
    }

    if (expiration_error) {
      console.error(expiration_error);
    }
  };

  return (
    <>
      <form onSubmit={joinNewPlaylistHandler}>
        <div
          onClick={() => {
            router.push("/playlist/main");
          }}
        >
          <h1 className="auth-main-title">
            c<span style={{ fontSize: 25, color: "#fb00a3" }}>✳︎</span>
            Track{" "}
          </h1>
        </div>
        <h1>Join to the New Playlist!</h1>

        <Flex>
          <TextInput placeholder="Invite code" radius="xl" size="md" w={300} ref={inviteCodeRef} />
          <Button variant="filled" color="#FB00A3" size="md" radius="xl" onClick={checkPlaylist}>
            Join
          </Button>
        </Flex>
      </form>
    </>
  );
};
export default JoinNewPlaylist;
