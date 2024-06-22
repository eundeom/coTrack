import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  // INSERT playlist_users - 플레이리스트 추가!
  // payload : insertUserPlayload (userInfo)

  const { userId, playlistId } = await req.json();
  let insertQuery;

  // if playlist_id is not already exist, then creator column should be TRUE
  const { data: existingPlaylist, error: existingPlaylistError } = await supabase
    .from("playlist_users")
    .select("*")
    .eq("playlist_id", playlistId);

  if (existingPlaylistError) {
    return NextResponse.json({ error: existingPlaylistError.message }, { status: 500 });
  }

  if (existingPlaylist && existingPlaylist.length > 0) {
    insertQuery = { user_id: userId, playlist_id: playlistId };
  } else {
    // if the creator makes playlist -> should be TRUE
    insertQuery = { user_id: userId, playlist_id: playlistId, creator: "TRUE" };
  }

  const { data, error } = await supabase.from("playlist_users").insert(insertQuery);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
