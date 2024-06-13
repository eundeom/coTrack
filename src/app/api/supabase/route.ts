import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  // await supabase.from()

  const { qType, payload } = await req.json();

  switch (qType) {
    // case "insert-playlist":
    //   return await insertPlaylist(payload);

    case "insert-user":
      return await insertUser(payload);

    case "insert-songs":
      return await insertSongs(payload);

    default:
      return NextResponse.json({ error: "Invalid query type" }, { status: 400 });
  }
}

// async function insertPlaylist(payload: any) {
//   // INSERT playlists - 플레이리스트 추가!
//   // payload : insertPlaylistPlayload (playlistInfo, select)
//   const { data, error } = await supabase
//     .from("playlists")
//     .insert(payload.playlistInfo)
//     .select(payload.select);
//   if (error) return NextResponse.json({ error: error.message }, { status: 500 });
//   return NextResponse.json({ data });
// }

async function insertUser(payload: any) {
  // INSERT playlist_users - 플레이리스트 추가!
  // payload : insertUserPlayload (userInfo)
  const { data, error } = await supabase.from("playlist_users").insert(payload.userInfo);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

async function insertSongs(payload: any) {
  // INSERT playlist_songs - 플레이리스트 추가!
  // payload : insertSongsPlayload ()
  const { data, error } = await supabase.from("playlist_songs").insert(payload.songsToInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
