"use client";
import { useUserState } from "@/app/context/user.provider";
// import { makeBrowserClient } from "@/utils/supabase/client";
import { supabase } from "@/utils/supabase/admin";
import { Button, Flex, Container } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// user name, follower, following

const MyPage = () => {
  const { userId } = useUserState();
  const router = useRouter();
  // const supabase = makeBrowserClient();

  const [username, setUsername] = useState<string>();
  const [followers, setFollowers] = useState<number>();
  const [following, setFollowing] = useState<number>();

  useEffect(() => {
    const getUserInfo = async () => {
      const getUserInfoResponse = await fetch("/api/user/getUserInfo", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      const getUserInfoResult = await getUserInfoResponse.json();
      const userData = getUserInfoResult.data;

      setUsername(userData?.username);
    };

    const getFollower = async () => {
      const getFollowerResponse = await fetch("/api/follow/getFollower", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      const getFollowerResult = await getFollowerResponse.json();

      setFollowers(getFollowerResult.data?.length);
    };

    const getFollowing = async () => {
      const getFollowingResponse = await fetch("/api/follow/getFollowing", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      const getFollowingResult = await getFollowingResponse.json();

      setFollowing(getFollowingResult.data?.length);
    };

    if (userId) {
      getUserInfo();

      getFollower();
      getFollowing();
    }
  });

  return (
    <>
      <Container mt={30} size="lg">
        <Flex justify="space-between" align="center" mb={60}>
          {/* undo button */}
          <Button variant="transparent" color="black" size="lg">
            <span
              onClick={() => {
                router.push("/playlist/main");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M15 6l-6 6l6 6" />
              </svg>
            </span>
          </Button>
          <h1>My page</h1>
          <Button
            variant="filled"
            color="#FB00A3"
            size="md"
            radius="xl"
            // onClick={}
          >
            Edit
          </Button>
        </Flex>
        <div style={{ margin: 100 }}>
          <h2>{username}</h2>
          <span>followers : {followers}</span>
          <span>&nbsp;</span>
          <span>following : {following === 0 ? 0 : following}</span>

          {/* invite code */}
          <div>
            <h2
              onClick={() => {
                router.push(`/playlist/joinNewPlaylist`);
              }}
            >
              Join new playlist!
            </h2>
          </div>
        </div>
      </Container>
    </>
  );
};
export default MyPage;
