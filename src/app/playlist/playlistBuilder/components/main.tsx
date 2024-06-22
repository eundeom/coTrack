"use client";
import { Container, Flex } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { getVisionZFile, useVisionZUpload } from "@visionz/upload-helper-react";
import { useRouter } from "next/navigation";
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

const PlaylistBuilderComponent = () => {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  // const { accessToken, setAccessToken } = useTokenState();
  const { getAccessToken } = useTokenState();
  // const [accessToken, setAccessToken] = useState<string>();
  const { userId } = useUserState();

  const { onFileChange, uploadSelectedFile, selectedFile } = useVisionZUpload("/api/upload");

  ////////////////////////////////////////////////////////////

  const createPlaylistHandler = async () => {
    // playlist title, description, playlist DB INSERT !!!! and redirect to playlist
    const uploadSrc = await uploadPlaylistCover();

    const playlist_name = titleRef.current!.value.trim();
    const description = descriptionRef.current!.value.trim();

    const generateInviteCode = () => {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const length = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8
      let inviteCode = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        inviteCode += characters[randomIndex];
      }

      return inviteCode;
    };
    const inviteCode = generateInviteCode();

    // invite code expiration time
    const currentTime = new Date();
    const after30 = new Date(currentTime.getTime() + 30 * 60000);

    // INSERT playlists - 플레이리스트 추가!
    const insertPlaylistPlayload = {
      playlistInfo: {
        created_by: userId,
        playlist_name,
        playlistcover: uploadSrc,
        description,
        invite_code: inviteCode,
        code_expiration_time: after30,
      },
      select: "id",
    };
    const playlistResponse = await fetch("/api/playlist/insertPlaylist", {
      method: "POST",
      body: JSON.stringify({
        payload: insertPlaylistPlayload,
      }),
    });

    const playlistResult = await playlistResponse.json();
    const playlistId = playlistResult.data[0].id;

    // INSERT playlist_users
    const userResponse = await fetch("/api/user/insertPlaylistUser", {
      method: "POST",
      body: JSON.stringify({ userId, playlistId }),
    });

    const userResult = await userResponse.json();
    if (userResponse.ok) {
      // setUserData(result.data);
    } else {
      console.error(userResult.error);
    }

    // INSERT playlist_songs
    const songsToInsert = playlist.map((track) => ({
      user_id: userId,
      song_id: track.id,
      playlist_id: playlistId,
    }));

    const insertSongsPlayload = { songsToInsert };

    const songsResponse = await fetch("/api/song/insertPlaylistSongs", {
      method: "POST",
      body: JSON.stringify({
        payload: insertSongsPlayload,
      }),
    });
    const songsResult = await songsResponse.json();
    if (songsResponse.ok) {
      // setUserData(result.data);
    } else {
      console.error(songsResult.error);
    }

    // create UUID
    let uuid = self.crypto.randomUUID();
    console.log(uuid);
    // DB insert

    router.push(`/playlist/${playlistId}`);
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
    const accessToken = await getAccessToken();
    const fetchedTracks = await searchTracks(query, accessToken);

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
