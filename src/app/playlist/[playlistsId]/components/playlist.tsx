"use client";
import {
  Flex,
  Button,
  Container,
  Modal,
  Chip,
  Image,
  CopyButton,
  ActionIcon,
  Tooltip,
  rem,
  Pill,
} from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import getTrack from "@/utils/spotify/getTrack";
import { useRouter } from "next/navigation";
import PlaylistItemsComponent from "./Items";
import { useTokenState } from "@/app/context/token.provider";
import { useUserState } from "@/app/context/user.provider";
import { getVisionZFile } from "@visionz/upload-helper-react";

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
  playlist_id: string;
};

const PlaylistsComponent = ({ playlistsId }: { playlistsId: string }) => {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState<string>();
  const [description, setDescription] = useState<string | null>();
  const { getAccessToken } = useTokenState();
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
  const [inviteCode, setInviteCode] = useState<string>("");
  const [creator, setCreator] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    const getSong = async () => {
      const getSongResponse = await fetch("/api/song/getSong", {
        method: "POST",
        body: JSON.stringify({ playlistsId }),
      });

      const getSongResult = await getSongResponse.json();

      const accessToken = await getAccessToken();

      if (accessToken) {
        const songIds = getSongResult.data.map((song: { song_id: any }) => song.song_id).join(",");
        const songInfo = await getTrack(songIds, accessToken);

        setTracks(songInfo);
      } else {
        console.log("no token");
      }
    };
    getSong();

    const getPlaylistInfo = async () => {
      const getPlaylistInfoResponse = await fetch("/api/playlist/getPlaylistInfo", {
        method: "POST",
        body: JSON.stringify({ playlistsId }),
      });

      const getPlaylistInfoResult = await getPlaylistInfoResponse.json();

      setPlaylistName(getPlaylistInfoResult.data.playlist_name);
      setDescription(getPlaylistInfoResult.data.description);
      if (getPlaylistInfoResult.data.created_by === userId) {
        setInviteCode(getPlaylistInfoResult.data.invite_code);
      }
    };
    getPlaylistInfo();

    const getCreatedWith = async () => {
      // get username from playlist_users

      const getCreatedWithResponse = await fetch("/api/user/getCreatedWith", {
        method: "POST",
        body: JSON.stringify({ playlistsId }),
      });

      const getCreatedWithResult = await getCreatedWithResponse.json();

      const createdWithData = getCreatedWithResult.data;

      if (createdWithData && createdWithData.length > 0) {
        const createdWithMap = createdWithData.map(
          async (data: { user_id: string; users: { username: string } }) => ({
            id: data.user_id,
            username: data.users?.username,
          }),
        );

        setCreatedWith(await Promise.all(createdWithMap));
      }
    };
    getCreatedWith();

    const checkCreator = async () => {
      const checkCreatorResponse = await fetch("/api/playlist/checkCreator", {
        method: "POST",
        body: JSON.stringify({ userId, playlistsId }),
      });
      const checkCreatorResult = await checkCreatorResponse.json();

      if (checkCreatorResult.data[0].creator === true) {
        setCreator(true);
      }
    };
    checkCreator();
  }, [getAccessToken, playlistsId, userId, inviteCode]);

  /////////////////////////////////////////////

  // user modal section
  const getFollower = async (userId: string) => {
    const getFollowerResponse = await fetch("/api/follow/getFollower", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    const getFollowerResult = await getFollowerResponse.json();

    setFollowers(getFollowerResult.data?.length);
  };

  const getFollowing = async (userId: string) => {
    const getFollowingResponse = await fetch("/api/follow/getFollowing", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    const getFollowingResult = await getFollowingResponse.json();

    setFollowing(getFollowingResult.data?.length);
  };

  useEffect(() => {
    if (opened) {
      const selectedUser: string =
        createdWith.find((user) => user.username === selectedUsername)?.id || "";

      // const selectedUserId = createdWith.find((user) => user.username === selectedUsername)?.id;

      setSelectedUserId(selectedUser);
    }

    // 내가 이 사람을 팔로우하고 있는지 확인 setFollow update
  }, [opened, createdWith, selectedUsername]);

  useEffect(() => {
    // check follow state
    const getFollowState = async () => {
      const getFollowStateResponse = await fetch("/api/follow/getFollowState", {
        method: "POST",
        body: JSON.stringify({ userId, selectedUserId }),
      });
      const getFollowStateResult = await getFollowStateResponse.json();

      if (getFollowStateResult) {
        setFollowChecked(true);
      } else {
        return;
      }
    };

    //  get playlist using selectedUserId
    const getPlaylist = async () => {
      const getPlaylistResponse = await fetch("/api/playlist/getPlaylist", {
        method: "POST",
        body: JSON.stringify({ payload: selectedUserId }),
      });

      const getPlaylistResult = await getPlaylistResponse.json();

      const getPlaylistData = getPlaylistResult.data;

      if (getPlaylistData && getPlaylistData.length > 0) {
        const playlistsData: Promise<playlistsData>[] = getPlaylistData.map(
          async (playlist: {
            playlists: { playlist_name: string; playlistcover: string | null };
            playlist_id: string;
          }) => ({
            name: playlist.playlists.playlist_name,
            cover: await convertToSrc(playlist.playlists.playlistcover),
            id: playlist.playlist_id,
          }),
        );
        setPlaylists(await Promise.all(playlistsData));
      }
      // setPlaylists(getPlaylistResult.data);
    };

    if (selectedUserId) {
      getFollowState();

      getFollower(selectedUserId);
      getFollowing(selectedUserId);

      getPlaylist();
    }
  }, [opened, selectedUserId, userId]);

  const convertToSrc = async (playlistCover: string | null) => {
    if (!playlistCover) return null;

    try {
      const imageSrc = await getVisionZFile(`${window.location.origin}/api/upload`, playlistCover);
      return imageSrc;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const userModal = () => {
    const updateFollow = async () => {
      if (followChecked) {
        // 팔로우 상태인데 누름 --> 팔로우 취소하기 (DB에서 삭제)

        const updateFollowResponse = await fetch("/api/follow/updateFollow", {
          method: "POST",
          body: JSON.stringify({ userId, selectedUserId, type: "delete" }),
        });

        await updateFollowResponse.json();

        // follower update
        getFollower(selectedUserId);
      } else {
        // 팔로우 안된 상태에서 누름 --> 팔로우 하기 (DB insert)
        const updateFollowResponse = await fetch("/api/follow/updateFollow", {
          method: "POST",
          body: JSON.stringify({ userId, selectedUserId, type: "insert" }),
        });

        await updateFollowResponse.json();

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
                onClick={updateFollow}
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

  /////////////////////////////////////////////
  const refreshInviteCode = async () => {
    // DB에 Update

    const updateInviteCodeResponse = await fetch("/api/playlist/updateInviteCode", {
      method: "POST",
      body: JSON.stringify({ playlistsId }),
    });

    await updateInviteCodeResponse.json();
    setInviteCode("");
  };

  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
      <path d="M20 4v5h-5" />
    </svg>
  );

  return (
    <>
      <Container mt={30} size="lg">
        <Flex justify="space-between" align="center" mb={60}>
          <Button variant="transparent" color="black" size="lg">
            <span
              onClick={() => {
                // previous page
                window.history.back();
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

        {userModal()}
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
                <Pill>{created.username}</Pill>
                <span>&nbsp;</span>
              </div>
            ))}
          </span>
        </div>
        {inviteCode && creator ? (
          <div style={{ marginLeft: 50 }}>
            <span style={{ display: "Flex", alignItems: "Center" }}>
              <span>
                invite code :<span>&nbsp;</span>
                <Pill>{inviteCode}</Pill>
              </span>

              <CopyButton value={inviteCode} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
                    <ActionIcon color={copied ? "teal" : "gray"} variant="subtle" onClick={copy}>
                      {copied ? (
                        <IconCheck style={{ width: rem(16) }} />
                      ) : (
                        <IconCopy style={{ width: rem(16) }} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>

              {/* refresh invite code */}
              <Button
                justify="center"
                leftSection={icon}
                variant="transparent"
                color="gray"
                w={14}
                onClick={refreshInviteCode}
              ></Button>
            </span>
          </div>
        ) : null}

        <PlaylistItemsComponent tracks={tracks} />
      </Container>
    </>
  );
};

PlaylistsComponent.displayName = "playlists";
export default PlaylistsComponent;
