"use client";
import { Container, Flex } from "@mantine/core";
import { useRef, useState } from "react";
import { getVisionZFile, useVisionZUpload } from "@visionz/upload-helper-react";
import { useRouter } from "next/navigation";
import { makeBrowserClient } from "@/utils/supabase/client";
import searchTracks from "@/utils/spotify/searchTrack";
import PlaylistItemsComponent from "./tracks";
import UploadFileComponent from "./uploadFile";
import HeaderComponent from "./header";
import { useTokenState } from "@/app/context/token.provider";
import { useUserState } from "@/app/context/user.provider";
import PlaylistInfoComponent from "./musicInfo";
import SearchItemsComponent from "./searchTracks";

type Track = {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
};

const PlaylistBuilderComponent = ({ access_token }: { access_token: string }) => {
  const router = useRouter();
  const supabase = makeBrowserClient();
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const { accessToken, setAccessToken } = useTokenState();
  const { userId } = useUserState();

  const { onFileChange, uploadSelectedFile, selectedFile } = useVisionZUpload("/api/upload");

  ////////////////////////////////////////////////////////////

  const createPlaylistHandler = async () => {
    // playlist title, description, playlist DB INSERT !!!! and redirect to playlist
    const uploadSrc = await uploadPlaylistCover();

    const playlist_name = titleRef.current!.value.trim();
    const description = descriptionRef.current!.value.trim();

    // invite code expiration time
    const currentTime = new Date();
    const after30 = new Date(currentTime.getTime() + 30 * 60000);

    const { data: playlistId, error: PlaylistError } = await supabase
      .from("playlists")
      .insert({
        created_by: userId,
        playlist_name,
        playlistcover: uploadSrc,
        description,
        code_expiration_time: after30,
      })
      .select("id");
    if (!playlistId) {
      console.error(PlaylistError);
    }

    // INSERT playlist_users
    const { data: userInsertData, error: userInsertError } = await supabase
      .from("playlist_users")
      .insert({ user_id: userId as string, playlist_id: playlistId![0].id });

    const songsToInsert = playlist.map((track) => ({
      user_id: userId,
      song_id: track.id,
      playlist_id: playlistId![0].id,
    }));

    const { error: InsertError } = await supabase.from("playlist_songs").insert(songsToInsert);

    if (InsertError) {
      console.error(InsertError);
    }

    // create UUID
    let uuid = self.crypto.randomUUID();
    console.log(uuid);
    // DB insert

    router.push(`/playlist/${playlistId![0].id}`);
  };

  const uploadPlaylistCover = async () => {
    try {
      const uploadId = await uploadSelectedFile();

      if (!uploadId) {
        console.log("No file selected.");
        return null;
      }

      // console.log("uploadId:", uploadId);

      const fileUrl = await getVisionZFile("/api/upload", uploadId);
      // console.log("fileUrl:", fileUrl);

      return uploadId;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  // search tracks - searchTrack.ts
  const searchTrackHandler = async () => {
    // allowing you to choose track / album, etc....
    const query = searchRef.current!.value.trim();

    // changed using provider.
    const fetchedTracks = await searchTracks(query, accessToken as string);
    // console.log(fetchedTracks);

    setTracks(fetchedTracks);
  };

  const addToPlaylist = (track: Track) => {
    // checking duplicates
    const isDuplicate = playlist.some(
      (item) => item.name === track.name && item.artist === track.artist,
    );

    if (!isDuplicate) {
      setPlaylist((prev) => [...prev, track]);
    } else {
      alert("This song has already been added to the playlist.");
    }
  };

  // delete a song from the playlist
  const removeFromPlaylist = (trackId: string) => {
    setPlaylist((prev) => prev.filter((track) => track.id !== trackId));
  };

  return (
    <>
      <Container mt={30} size="lg">
        <HeaderComponent createPlaylistHandler={createPlaylistHandler} />
        <Flex>
          <UploadFileComponent onFileChange={onFileChange} selectedFile={selectedFile} />

          <PlaylistInfoComponent
            titleRef={titleRef}
            descriptionRef={descriptionRef}
            searchRef={searchRef}
            searchTrackHandler={searchTrackHandler}
          />
        </Flex>
        <SearchItemsComponent tracks={tracks} addToPlaylist={addToPlaylist} />
        <div>
          <PlaylistItemsComponent playlist={playlist} removeFromPlaylist={removeFromPlaylist} />
        </div>
      </Container>
    </>
  );
};

export default PlaylistBuilderComponent;
