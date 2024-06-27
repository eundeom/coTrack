import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { playlistsId } = await req.json();

  // songs
  const { data: deleteSongsData, error: deleteSongsError } = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistsId);

  if (deleteSongsError) throw deleteSongsError;

  // users
  const { data: deleteUsersData, error: deleteUsersError } = await supabase
    .from("playlist_users")
    .delete()
    .eq("playlist_id", playlistsId);

  if (deleteUsersError) throw deleteUsersError;

  // playlist
  const { data: deletePlaylistData, error: deletePlaylistError } = await supabase
    .from("playlists")
    .delete()
    .eq("playlist_id", playlistsId);

  if (deletePlaylistError)
    return NextResponse.json({ error: deletePlaylistError.message }, { status: 500 });
  return NextResponse.json({ deletePlaylistData });
}
