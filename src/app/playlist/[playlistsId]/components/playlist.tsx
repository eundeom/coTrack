"use client";
import { Flex, Button, Container, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createClient } from "@/utils/supabase/client";
import { SetStateAction, useEffect, useState } from "react";
import getTrack from "@/utils/spotify/getTrack";
import { useRouter } from "next/navigation";
import PlaylistItemsComponent from "./Items";
import { useTokenState } from "@/app/context/token.provider";
import { useUserState } from "@/app/context/user.provider";
// import UserModal from "./userModal";

type Track = {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
};

const PlaylistsComponent = ({ playlistsId }: { playlistsId: string }) => {
  const router = useRouter();
  const supabase = createClient();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState<string>();
  const [description, setDescription] = useState<string | null>();
  const { accessToken } = useTokenState();
  const { userId } = useUserState();
  const [createdWith, setCreateWith] = useState<{ username: string | null | undefined }[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [follow, setFollow] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [followers, setFollowers] = useState<number>();
  const [following, setFollowing] = useState<number>();

  useEffect(() => {
    const getSong = async () => {
      // get the song id [skdh, sidjhf, sdoi, ...]

      const { data: SongData, error } = await supabase
        .from("playlist_songs")
        .select("song_id")
        .eq("playlist_id", playlistsId);

      if (error) {
        console.error(error);
        return;
      }
      const songIds = SongData.map((song) => song.song_id).join(",");
      const songInfo = await getTrack(songIds, accessToken);
      setTracks(songInfo);
    };
    getSong();

    const getPlaylistInfo = async () => {
      const { data: playlistData, error: playlistError } = await supabase
        .from("playlists")
        .select("playlist_name, description, playlistcover")
        .eq("id", playlistsId);

      if (!playlistData) {
        console.error(playlistError);
      }
      setPlaylistName(playlistData![0].playlist_name);
      setDescription(playlistData![0].description);

      // const imageSrc = await getVisionZFile(
      //   "http://localhost:3000/api/upload",
      //   playlistData![0].playlistcover
      // );

      // setplaylistCover(imageSrcs);
    };
    getPlaylistInfo();
    console.log(createdWith);

    const getCreatedWith = async () => {
      // get username from playlist_users
      const { data: createdWithData, error } = await supabase
        .from("playlist_users")
        .select(
          `
    user_id,
    users (
      username
    )
  `,
        )
        .eq("playlist_id", playlistsId);

      // console.log("cdata", createdWithData);

      if (createdWithData && createdWithData.length > 0) {
        const createdWithMap = createdWithData.map(async (data) => ({
          id: data.user_id,
          username: await userIdToName(data.user_id),
        }));
        console.log(createdWithMap);

        setCreateWith(await Promise.all(createdWithMap));
      }
    };
    getCreatedWith();
  }, [accessToken, playlistsId, supabase]);

  const userIdToName = async (userId: string) => {
    if (!userId) return null;

    const { data: UsernameData, error } = await supabase
      .from("users")
      .select("username")
      .eq("id", userId);

    if (UsernameData) {
      return UsernameData[0]?.username;
    } else {
      return;
    }
  };

  // user modal section
  const getFollower = async (userId: string) => {
    const selectedUserId = createdWith.find((user) => user.username === selectedUsername)?.id;

    const { data: followerData, error: followerError } = await supabase
      .from("followers")
      .select("*")
      .eq("follow", userId);

    console.log("followerData", followerData);

    setFollowers(followerData?.length);
  };

  const getFollowing = async (userId: string) => {
    const selectedUserId = createdWith.find((user) => user.username === selectedUsername)?.id;

    const { data: followingsData, error: followingError } = await supabase
      .from("followers")
      .select("*")
      .eq("user_id", userId);

    setFollowing(followingsData?.length);
  };

  useEffect(() => {
    if (opened) {
      // const selectedUserId = createdWith.find((user) => user.username === selectedUsername)?.id;
      setSelectedUserId(createdWith.find((user) => user.username === selectedUsername)?.id);
      if (selectedUserId) {
        getFollower(selectedUserId);
        getFollowing(selectedUserId);
      }
    }

    // 내가 이 사람을 팔로우하고 있는지 확인 setFollow update
  }, [opened, createdWith, selectedUsername]);

  const userModal = () => {
    const followUpdate = async () => {
      if (follow === true) {
        // 팔로우 상태인데 누른거임 --> 팔로우 취소하기 (DB에서 삭제)
        const response = await supabase.from("followers").delete().eq("id", selectedUserId);
      } else {
        // 팔로우 안된 상태에서 누른거임 --> 팔로우 하기 (DB insert)
        const { data: followData, error: followError } = await supabase
          .from("followers")
          .insert({ user_id: userId as string, follow: selectedUserId });
      }
    };
    return (
      <>
        <Modal opened={opened} onClose={close} title={`${selectedUsername}`} centered>
          <Flex justify="space-between" align="center">
            <div>
              <span>follower : </span>
              {followers}
              <span>&nbsp;</span>
              <span>following : </span>
              {following}
            </div>

            {userId !== selectedUserId && (
              <Button
                variant="filled"
                color="#FB00A3"
                size="xs"
                radius="xl"
                // onClick={followUpdate}
              >
                {follow ? "Following" : "Follow"}
              </Button>
            )}
          </Flex>
        </Modal>
      </>
    );
  };

  return (
    <>
      <Container mt={30} size="lg">
        <Flex justify="space-between" align="center" mb={60}>
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
          <h1 style={{ fontSize: 40 }}>{playlistName}</h1>
          <Button
            variant="filled"
            color="#FB00A3"
            size="md"
            radius="xl"
            // onClick={() => {
            //   router.push("/");
            // }}
          >
            Edit
          </Button>
        </Flex>
        <h2 style={{ marginLeft: 50, color: "lightgray" }}>{description}</h2>
        {/* created with */}
        {userModal()}
        {/* <UserModal opened={opened} username={selectedUsername} onClose={close} followers={followers} following={following}/> */}
        <div style={{ marginLeft: 50 }}>
          <span>
            created by :<span>&nbsp;</span>
            {createdWith.map((created, index) => (
              <div
                key={index}
                style={{ display: "inline-block" }}
                // onClick={open}
                onClick={() => {
                  setSelectedUsername(created.username as string);

                  open();
                }}
              >
                <p> {created.username}</p>
              </div>
            ))}
          </span>
        </div>

        <PlaylistItemsComponent tracks={tracks} />
      </Container>
    </>
  );
};

PlaylistsComponent.displayName = "playlists";
export default PlaylistsComponent;
