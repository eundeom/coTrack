"use client";
import { Flex, Button, Container, Modal, Chip, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createClient } from "@/utils/supabase/client";
import { SetStateAction, useEffect, useState } from "react";
import getTrack from "@/utils/spotify/getTrack";
import { useRouter } from "next/navigation";
import PlaylistItemsComponent from "./Items";
import { useTokenState } from "@/app/context/token.provider";
import { useUserState } from "@/app/context/user.provider";
import fetchPlaylist from "@/utils/coTrack/fetchPlaylist";
// import UserModal from "./userModal";

type Track = {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
};

type playlistsData = {
  name: string;
  cover: string | null;
  id: string;
};

const PlaylistsComponent = ({ playlistsId }: { playlistsId: string }) => {
  const router = useRouter();
  const supabase = createClient();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState<string>();
  const [description, setDescription] = useState<string | null>();
  const { accessToken } = useTokenState();
  const { userId } = useUserState();
  const [createdWith, setCreatedWith] = useState<
    {
      id: string;
      username: string | null | undefined;
    }[]
  >([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [followers, setFollowers] = useState<number>();
  const [following, setFollowing] = useState<number>();
  const [followChecked, setFollowChecked] = useState(false); // chip
  const [playlists, setPlaylists] = useState<playlistsData[] | undefined>([]);

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

      if (createdWithData && createdWithData.length > 0) {
        const createdWithMap = createdWithData.map(async (data) => ({
          id: data.user_id,
          username: await userIdToName(data.user_id),
        }));

        setCreatedWith(await Promise.all(createdWithMap));
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
      const selectedUser: string =
        createdWith.find((user) => user.username === selectedUsername)?.id || "";

      setSelectedUserId(selectedUser);
    }

    // 내가 이 사람을 팔로우하고 있는지 확인 setFollow update
  }, [opened, createdWith, selectedUsername]);

  useEffect(() => {
    // check follow state
    const getFollowState = async () => {
      const { data: followState, error: followError } = await supabase
        .from("followers")
        .select("*")
        .eq("user_id", userId as string)
        .eq("follow", selectedUserId as string);

      if (followState) {
        setFollowChecked(true);
      } else {
        return;
      }
    };
    getFollowState();

    getFollower(selectedUserId);
    getFollowing(selectedUserId);

    //  get playlist using selectedUserId
    const getPlaylist = async () => {
      const fetchedPlaylist = await fetchPlaylist(selectedUserId as string);
      setPlaylists(fetchedPlaylist);
    };
    getPlaylist();
  }, [selectedUserId]);
  // if selectedUserId is exist

  const userModal = () => {
    const followUpdate = async () => {
      if (followChecked) {
        // 팔로우 상태인데 누른거임 --> 팔로우 취소하기 (DB에서 삭제)
        const response = await supabase
          .from("followers")
          .delete()
          .eq("user_id", userId as string)
          .eq("follow", selectedUserId);

        // follower update
        getFollower(selectedUserId);
      } else {
        // 팔로우 안된 상태에서 누른거임 --> 팔로우 하기 (DB insert)
        const { data: followData, error: followError } = await supabase
          .from("followers")
          .insert({ user_id: userId as string, follow: selectedUserId });

        getFollower(selectedUserId);
      }
    };

    const moveToPlaylist = async (playlistId: string) => {
      router.push(`/playlist/${playlistId}`);
    };

    return (
      <>
        <Modal opened={opened} onClose={close} title=<b>{`${selectedUsername}`}</b> centered>
          {/* username / follower, following / follow button → 클릭하면 바로 DB 반영 / playlist → 클릭하면 플레이리스트로 이동 */}
          {/* user id : createdWith.find((user) => user.username === selectedUsername)?.id */}
          <Flex justify="space-between" align="center">
            <div>
              <span>following : </span>
              {following}
              <span>&nbsp;</span>
              <span>follower : </span>
              {followers}
            </div>

            {userId !== selectedUserId && (
              <Chip
                checked={followChecked}
                onChange={() => setFollowChecked((v) => !v)}
                color="#fb00a3"
                onClick={followUpdate}
              >
                Follow
              </Chip>
            )}
          </Flex>

          {/* display mini playlist */}
          <br />
          <p>- {selectedUsername} collection -</p>

          {playlists?.map((playlist, index) => (
            <div
              key={index}
              style={{ display: "inline-block", margin: 10 }}
              onClick={() => moveToPlaylist(playlist.id)}
            >
              <Image
                radius="lg"
                src={playlist.cover}
                alt={`Playlist ${index + 1}`}
                w={100}
                h={100}
                // onClick={() => moveToPlaylist(playlist.id)}
              />

              <div>
                <p>{playlist.name}</p>
              </div>
            </div>
          ))}
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
                <p>
                  {" "}
                  {created.username}
                  <span>&nbsp;</span>
                </p>
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
