import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { playlistsId, title, description } = await req.json();

  const { data, error } = await supabase
    .from("playlists")
    .update({ playlist_name: title, description: description })
    .eq("id", playlistsId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
