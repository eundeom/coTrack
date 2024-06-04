"use client";
import { Button, Flex, TextInput } from "@mantine/core";
import { useRef } from "react";
import { useRouter } from "next/navigation";

const JoinNewPlaylist = () => {
  const router = useRouter();
  const inviteCodeRef = useRef<HTMLInputElement>(null);

  const joinNewPlaylistHandler = () => {};

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
          <Button variant="filled" color="#FB00A3" size="md" radius="xl">
            Join
          </Button>
        </Flex>
      </form>
    </>
  );
};
export default JoinNewPlaylist;
