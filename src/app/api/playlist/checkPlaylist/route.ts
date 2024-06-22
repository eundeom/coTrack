import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  // check playlist
  const { inviteCode, userId } = await req.json();

  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("invite_code", inviteCode);

  if (data && data.length > 0) {
    // check expiration time
    const currentTime = new Date();
    // console.log("data[0]", data[0]);

    const playlist = data[0] as {
      id: string;
      created_by: string;
      playlist_name: string;
      created_at: string;
      playlistcover: string | null;
      description: string | null;
      invite_code: string;
      code_expiration_time: string;
    };

    const expiration = new Date(playlist.code_expiration_time);
    // const expirationTime = expiration.toISOString();

    // 만약 유저 아이디가 플레이리스트 아이디에 이미 들어가 있으면 중복취소
    if (currentTime > expiration) {
      // expired
      return NextResponse.json({ error: "This code has expired!" }, { status: 400 });
    } else {
      const { error: insertError } = await supabase
        .from("playlist_users")
        .insert({ user_id: userId as string, playlist_id: data![0].id });

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
      return NextResponse.json({ success: true, data: data[0] });
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
