import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { playlistsId } = await req.json();

  const inviteCode: string = generateInviteCode();

  // invite code expiration time
  const currentTime = new Date();
  const after30 = new Date(currentTime.getTime() + 30 * 60000).toISOString();

  const { data, error } = await supabase
    .from("playlists")
    .update({ invite_code: inviteCode, code_expiration_time: after30 })
    .eq("id", playlistsId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

function generateInviteCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 3) + 6; // 6, 7, or 8
  let inviteCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    inviteCode += characters[randomIndex];
  }

  return inviteCode;
}
