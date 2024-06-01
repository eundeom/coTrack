"use client";
import { Flex, Button, Container } from "@mantine/core";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import getTrack from "@/utils/spotify/getTrack";
import { useRouter } from "next/navigation";
import PlaylistItemsComponent from "./Items";
import { useTokenState } from "@/app/context/token.provider";

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
  const [createdWith, setCreateWith] = useState<{ username: string | null | undefined }[]>([]);

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
      // playlist_users 테이블의 user name을 가져오기
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

      console.log("cdata", createdWithData);
      if (createdWithData && createdWithData.length > 0) {
        const createdWithMap = createdWithData.map(async (data) => ({
          // id: data.user_id,
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
        <div style={{ marginLeft: 50 }}>
          <span>
            created by :<span>&nbsp;</span>
            {createdWith.map((created, index) => (
              <div key={index} style={{ display: "inline-block" }}>
                <span> {created.username}</span>
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
