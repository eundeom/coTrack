"use client";
import { Container, Flex } from "@mantine/core";
import HeaderComponent from "./components/header";
import PlaylistInfoComponent from "../../playlistBuilder/components/musicInfo";
import SearchItemsComponent from "../../playlistBuilder/components/searchTracks";
import UploadFileComponent from "./components/uploadFile";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getVisionZFile, useVisionZUpload } from "@visionz/upload-helper-react";
import { useTokenState } from "@/app/context/token.provider";
import { useUserState } from "@/app/context/user.provider";
import searchTracks from "@/utils/spotify/searchTrack";
import getTrack from "@/utils/spotify/getTrack";
import PlaylistItemsComponent from "../../playlistBuilder/components/tracks";
import PlaylistUsersComponent from "./components/users";

type Track = {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
};
type User = {
  user_id: string;
  users: {
    username: string;
  };
};

// title, description, member 수정은 playlist creator만 뜬다 !!
// creator가 아니면 music 관리만 할 수 있음 !!

const EditPlaylist = ({ params: { playlistsId } }: { params: { playlistsId: string } }) => {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<string>("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const { getAccessToken } = useTokenState();
  const { userId } = useUserState();
  const { onFileChange, uploadSelectedFile, selectedFile } = useVisionZUpload("/api/upload");
  const [creator, setCreator] = useState<string | null>("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    /* useEffect로 처음에 타이틀이랑 description, 노래 목록 불러오기 */
    const getPrePlaylistInfo = async () => {
      const prePlaylistResponse = await fetch("/api/playlist/getPrePlaylist", {
        method: "POST",
        body: JSON.stringify({ playlistsId }),
      });

      const prePlaylistInfoResult = await prePlaylistResponse.json();

      if (titleRef.current && descriptionRef.current) {
        titleRef.current.value = prePlaylistInfoResult.data[0].playlist_name;
        descriptionRef.current.value = prePlaylistInfoResult.data[0].description;
        coverRef.current = prePlaylistInfoResult.data[0].playlistcover;
      }
    };

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

        setPlaylist(songInfo);
      } else {
        console.log("no token");
      }
    };
    getSong();

    const checkCreator = async () => {
      const checkCreatorResponse = await fetch("/api/playlist/checkCreator", {
        method: "POST",
        body: JSON.stringify({ userId, playlistsId }),
      });
      const checkCreatorResult = await checkCreatorResponse.json();

      if (checkCreatorResult.data[0]) {
        if (checkCreatorResult.data[0].creator === true) {
          setCreator(userId);
        }
      }
    };
    checkCreator();

    const getPlaylistUsers = async () => {
      const playlistUsersResponse = await fetch("/api/user/getPlaylistUsers", {
        method: "POST",
        body: JSON.stringify({ playlistsId }),
      });

      const playlistUsersResult = await playlistUsersResponse.json();

      if (playlistUsersResponse.ok) {
        setUsers(playlistUsersResult.data);
      }
    };
    getPlaylistUsers();

    if (userId) {
      getPrePlaylistInfo();
    }
  }, [getAccessToken, playlistsId, userId]);

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

  const doneToEditPlaylist = async () => {
    // 수정 버튼 누르면 DB update
    // users
    // playlist
    const updatePlaylistResponse = await fetch("/api/playlist/updatePlaylist", {
      method: "POST",
      body: JSON.stringify({
        playlistsId,
        title: titleRef.current?.value,
        description: descriptionRef.current?.value,
      }),
    });

    const updatePlaylistResult = await updatePlaylistResponse.json();

    if (updatePlaylistResponse.ok) {
      router.push(`/playlist/${playlistsId}`);
    }
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

  const addToPlaylist = async (track: Track) => {
    // checking duplicates
    const isDuplicate = playlist.some(
      (item) => item.name === track.name && item.artist === track.artist,
    );

    if (!isDuplicate) {
      setPlaylist((prev) => [...prev, track]);

      // 바로 DB에 추가
      const songsToInsert = {
        user_id: userId,
        song_id: track.id,
        playlist_id: playlistsId,
      };

      const insertSongsPlayload = { songsToInsert };

      const songsResponse = await fetch("/api/song/insertPlaylistSongs", {
        method: "POST",
        body: JSON.stringify({
          payload: insertSongsPlayload,
        }),
      });
      const songsResult = await songsResponse.json();
    } else {
      alert("This song has already been added to the playlist.");
    }
  };

  // delete a song from the playlist
  const removeFromPlaylist = async (trackId: string) => {
    setPlaylist((prev) => prev.filter((track) => track.id !== trackId));

    const deleteSongsResponse = await fetch("/api/song/deletePlaylistSongs", {
      method: "POST",
      body: JSON.stringify({ song_id: trackId }),
    });

    const deleteSongsResult = await deleteSongsResponse.json();
  };

  const removeUsers = async (userId: string) => {
    // x 버튼 누르면 playlist_users에서 user 바로 삭제!
    const removeUsersResponse = await fetch("/api/user/removeUsers", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    const removeUsersResult = await removeUsersResponse.json();
  };

  const deletePlaylist = async () => {
    // songs
    // users
    // playlists

    const deletePlaylistResponse = await fetch("/api/playlist/deletePlaylist", {
      method: "POST",
      body: JSON.stringify({ playlistsId }),
    });

    const deletePlaylistResult = deletePlaylistResponse.json();
    if (deletePlaylistResponse.ok) {
      router.push("/playlist/main");
    }
  };

  return (
    <>
      <Container mt={30} size="lg">
        {/* 수정 DONE 버튼 */}
        <HeaderComponent
          doneToEditPlaylist={doneToEditPlaylist}
          deletePlaylist={deletePlaylist}
          creator={creator}
        />
        <Flex>
          {/* 파일 업로드 버튼 */}
          <UploadFileComponent
            onFileChange={onFileChange}
            selectedFile={selectedFile}
            preCover={coverRef}
          />

          <Flex direction="column">
            {/* 플레이리스트 정보 수정 input - 이 전 정보 불러오기 */}
            <PlaylistInfoComponent
              titleRef={titleRef}
              descriptionRef={descriptionRef}
              searchRef={searchRef}
              searchTrackHandler={searchTrackHandler}
            />
            {/* 지금 채팅방 참여 유저 삭제 관리 */}
            {creator !== "" ? (
              <PlaylistUsersComponent users={users} creator={creator} removeUsers={removeUsers} />
            ) : null}
          </Flex>
        </Flex>
        {/* 음악 검색 -> 그대로 사용 */}
        <SearchItemsComponent tracks={tracks} addToPlaylist={addToPlaylist} />
        <div>
          <PlaylistItemsComponent playlist={playlist} removeFromPlaylist={removeFromPlaylist} />
        </div>
      </Container>
    </>
  );
};

export default EditPlaylist;
