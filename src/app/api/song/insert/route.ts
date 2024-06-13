import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  // INSERT playlist_songs - 플레이리스트 추가!
  // payload : insertSongsPlayload ()

  const { payload } = await req.json();

  const { data, error } = await supabase.from("playlist_songs").insert(payload.songsToInsert);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
