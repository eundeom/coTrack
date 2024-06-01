"use client";
import Link from "next/link";
import { Image, Flex, Button, Center, TextInput, Autocomplete } from "@mantine/core";
import "../../../../app/globals.css";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "../../playlist.css";
import { getVisionZFile } from "@visionz/upload-helper-react";
import { useUserState } from "@/app/context/user.provider";
import searchTracks from "../../playlistBuilder/components/searchTracks";
import { useTokenState } from "@/app/context/token.provider";

/**
 * playlist slide ..
 */

type PlaylistProps = {
  // userId: string | null;
  username: string | null;
};

type Track = {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
};

type playlistData = {
  created_at: string;
  created_by: string;
  description: string | null;
  id: string;
  playlist_name: string;
  playlistcover: string | null;
};

const PlaylistComponent = ({ username }: PlaylistProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [playlists, setPlaylists] = useState<{ name: string; cover: string | null; id: string }[]>(
    [],
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [allPlaylists, setAllplaylists] = useState<playlistData[] | null>([]);
  const { userId } = useUserState();
  const { accessToken } = useTokenState();

  useEffect(() => {
    if (!username) {
      router.push("/auth/login");
    }

    // get playlist cover image (including user id) from supabase
    const fetchPlaylists = async () => {
      try {
        const { data: Cdata, error } = await supabase
          .from("playlists")
          .select("playlist_name, playlistcover, id")
          .eq("created_by", userId as string);

        if (error) {
          throw error;
        }

        // save the imported image URL as a map in an array.
        if (Cdata && Cdata.length > 0) {
          const playlistsData = Cdata.map(async (playlist) => ({
            name: playlist.playlist_name,
            // cover: playlist.playlistcover,
            cover: await convertToSrc(playlist.playlistcover),
            id: playlist.id,
          }));

          // Promise.allSettled(playlistsData)
          // .then(arr => {
          //   if(arr[0].status === "fulfilled"){
          //     arr[0].value
          //   }
          //   if (arr[0].status === "rejected") {
          //     arr[0].reason
          //   }

          //   arr[0].data
          // })

          setPlaylists(await Promise.all(playlistsData));
        }
      } catch (error) {
        console.log("log in failed");
      }
    };
    fetchPlaylists();

    // get all playlist for autocomplete
    const getAllPlaylist = async () => {
      const { data: playlistData, error: Perror } = await supabase.from("playlists").select("*");
      setAllplaylists(playlistData);
    };
    getAllPlaylist();
  }, [router, supabase, userId, username]);

  // autocomplete array
  const playlistNames = Array.from(
    new Set(allPlaylists!.map((playlist) => playlist.playlist_name)),
  );

  const convertToSrc = async (playlistCover: string | null) => {
    if (!playlistCover) return null;

    try {
      const imageSrc = await getVisionZFile("http://localhost:3000/api/upload", playlistCover);
      return imageSrc;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const logOutHandler = async () => {
    const { error } = await supabase.auth.signOut();

    const { error: Derror } = await supabase
      .from("token")
      .delete()
      .eq("user_id", userId as string);

    router.replace("/auth/login");
  };

  // click cover image -> move to playlist
  const moveToPlaylist = async (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };

  return (
    <>
      {/* My playlists */}

      <div className="container">
        <div className="playlist-container">
          <Flex justify="space-between" align="center" mb={60} direction="row" mt={20}>
            <div className="playlist-header">
              <div className="user-info">
                <Flex>
                  {username ? (
                    <>
                      <p>
                        Welcome <span style={{ color: "#fb00a3" }}>{username}</span>!
                      </p>
                      <p>&nbsp;&nbsp;|&nbsp;&nbsp;</p>
                      <Link href={`/mypage/${userId}`}>
                        <p>My Page</p>
                      </Link>
                      <p>&nbsp;&nbsp;|&nbsp;&nbsp;</p>

                      <a href="#" onClick={logOutHandler}>
                        Log out
                      </a>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/signup">
                        <p>Sign up</p>
                      </Link>
                      <p>&nbsp;&nbsp;|&nbsp;&nbsp;</p>
                      <Link href="/auth/login">
                        <p>Log in</p>
                      </Link>
                      <p>&nbsp;&nbsp;|&nbsp;&nbsp;</p>
                      <Link href="/mypage">
                        <p>My Page</p>
                      </Link>
                    </>
                  )}
                </Flex>
              </div>
            </div>

            <h1 className="auth-main-title">
              c<span style={{ fontSize: 25, color: "#fb00a3" }}>✳︎</span>
              Track{" "}
            </h1>

            {/* search playlist */}
            <Flex>
              <Autocomplete
                data={playlistNames}
                placeholder="Search playlist"
                radius="xl"
                size="md"
                mt={20}
                w={300}
                ref={searchRef}
                // limit={3}

                maxDropdownHeight={120}
              />

              <Button variant="filled" color="#FB00A3" size="md" radius="xl" mt={20} ml={5}>
                Search
              </Button>
            </Flex>
          </Flex>

          <Flex direction="column" m={80} w={1400}>
            <h1 className="playlist-category">My Playlists</h1>
            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={{ base: "sm", sm: "lg" }}
              justify={{ sm: "left" }}
            >
              {username ? (
                <>
                  <div className="playlist-item">
                    <div
                      style={{
                        backgroundColor: "#F9F9F9",
                        width: 260,
                        height: 260,
                        borderRadius: 14,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {/* make a new playlist */}
                      <Button
                        onClick={() => {
                          router.push("/playlist/playlistBuilder");
                        }}
                        variant="transparent"
                        color="rgba(0, 0, 0, 1)"
                        size="xl"
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
                          className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M12 5l0 14" />
                          <path d="M5 12l14 0" />
                        </svg>
                      </Button>
                    </div>
                    <div className="playlist-title">
                      <h3>Add new playlist</h3>
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}

              {playlists.map((playlist, index) => (
                <div key={index} className="playlist-item">
                  {playlist.cover === null ? (
                    <div style={{ width: 300, height: 300 }}>
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
                        className="icon icon-tabler icons-tabler-outline icon-tabler-circle-dotted"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M7.5 4.21l0 .01" />
                        <path d="M4.21 7.5l0 .01" />
                        <path d="M3 12l0 .01" />
                        <path d="M4.21 16.5l0 .01" />
                        <path d="M7.5 19.79l0 .01" />
                        <path d="M12 21l0 .01" />
                        <path d="M16.5 19.79l0 .01" />
                        <path d="M19.79 16.5l0 .01" />
                        <path d="M21 12l0 .01" />
                        <path d="M19.79 7.5l0 .01" />
                        <path d="M16.5 4.21l0 .01" />
                        <path d="M12 3l0 .01" />
                      </svg>
                    </div>
                  ) : (
                    <Image
                      radius="lg"
                      src={playlist.cover}
                      alt={`Playlist ${index + 1}`}
                      w={300}
                      h={300}
                      onClick={() => moveToPlaylist(playlist.id)}
                    />
                  )}

                  <div className="playlist-title">
                    <h3>{playlist.name}</h3>
                  </div>
                </div>
              ))}
            </Flex>
          </Flex>
        </div>

        {/* Recommend playlists */}
        <div className="playlist-container">
          <Flex direction="column" m={80} w={1400}>
            <h1 className="playlist-category">Recommend for {username}</h1>
            <Flex
              direction={{ base: "column", sm: "row" }}
              gap={{ base: "sm", sm: "lg" }}
              justify={{ sm: "left" }}
            >
              {playlists.map((playlist, index) => (
                <div key={index} className="playlist-item">
                  <Image
                    radius="lg"
                    src={playlist.cover}
                    alt={`Playlist ${index + 1}`}
                    w={300}
                    h={300}
                    onClick={() => moveToPlaylist(playlist.name)}
                  />
                  <div className="playlist-title">
                    <h3>{playlist.name}</h3>
                  </div>
                </div>
              ))}
            </Flex>
          </Flex>
        </div>
      </div>
    </>
  );
};

export default PlaylistComponent;
