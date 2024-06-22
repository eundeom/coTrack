import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

type playlistsData = {
  name: string;
  cover: string | null;
  id: string;
};

export async function POST(req: NextRequest) {
  const { payload } = await req.json();

  const { data, error } = await supabase
    .from("playlist_users")
    .select(
      `
playlist_id,
playlists (
  id,
  playlist_name,
  playlistcover
)
`,
    )
    .eq("user_id", payload as string);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
