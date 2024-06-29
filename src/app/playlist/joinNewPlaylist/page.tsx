"use client";
import { Button, Flex, TextInput } from "@mantine/core";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserState } from "@/app/context/user.provider";

const JoinNewPlaylist = () => {
  const router = useRouter();
  const inviteCodeRef = useRef<HTMLInputElement>(null);
  const { userId } = useUserState();

  const joinNewPlaylistHandler = () => {};

  const checkPlaylist = async () => {
    const inviteCode = inviteCodeRef.current!.value.trim();

    const checkPlaylistResponse = await fetch("/api/playlist/checkPlaylist", {
      method: "POST",
      body: JSON.stringify({ inviteCode, userId }),
    });

    const checkPlaylistResult = await checkPlaylistResponse.json();

    if (checkPlaylistResponse.ok && checkPlaylistResult.success) {
      alert("Playlist joined successfully!");
      router.push("/playlist/main");
    } else {
      alert(checkPlaylistResult.error);
    }
  };

  return (
    <>
      <form onSubmit={joinNewPlaylistHandler}>
        <Flex justify="center" align="center" direction="column" gap="lg" m={100}>
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
            <TextInput
              placeholder="Invite code"
              radius="xl"
              size="md"
              w={300}
              ref={inviteCodeRef}
            />
            <Button variant="filled" color="#FB00A3" size="md" radius="xl" onClick={checkPlaylist}>
              Join
            </Button>
          </Flex>
        </Flex>
      </form>
    </>
  );
};
export default JoinNewPlaylist;
