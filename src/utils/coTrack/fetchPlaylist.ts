// 디비를 쓴다면 그냥 userId를 payload로 받는 API를 만드는게 낫지 않을까?

import { getVisionZFile } from "@visionz/upload-helper-react";
import { createClient } from "../supabase/client";

type playlistsData = {
  name: string;
  cover: string | null;
  id: string;
};

const fetchPlaylist = async (userId: string) => {
  const supabase = createClient();
  try {
    const { data: getPlaylistData, error: getPlaylistError } = await supabase
      .from("playlist_users")
      .select(
        `
    playlist_id,
    playlists (
      id,
      playlist_name,
      playlistcover
    )
  `,
      )
      .eq("user_id", userId as string);

    if (getPlaylistError) {
      throw getPlaylistError;
    }

    if (getPlaylistData && getPlaylistData.length > 0) {
      const playlistsData: Promise<playlistsData>[] = getPlaylistData.map(async (playlist) => ({
        name: playlist.playlists.playlist_name,
        cover: await convertToSrc(playlist.playlists.playlistcover),
        id: playlist.playlist_id,
      }));
      //   setPlaylists(await Promise.all(playlistsData));
      return await Promise.all(playlistsData);
    }
  } catch (error) {
    console.log("log in failed");
  }
};

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

export default fetchPlaylist;
