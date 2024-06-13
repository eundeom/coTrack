import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { playlistsId } = await req.json();

  const { data, error } = await supabase
    .from("playlists")
    .select("playlist_name, description, playlistcover")
    .eq("id", playlistsId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
