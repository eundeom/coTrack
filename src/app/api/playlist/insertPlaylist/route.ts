import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  // INSERT playlists - 플레이리스트 추가!
  // payload : insertPlaylistPlayload (playlistInfo, select)

  const { payload } = await req.json();

  const { data, error } = await supabase
    .from("playlists")
    .insert(payload.playlistInfo)
    .select(payload.select);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
