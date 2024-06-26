import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { song_id } = await req.json();

  const { data, error } = await supabase.from("playlist_songs").delete().eq("song_id", song_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
