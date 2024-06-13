import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { playlistsId } = await req.json();

  const { data, error } = await supabase
    .from("playlist_songs")
    .select("song_id")
    .eq("playlist_id", playlistsId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
