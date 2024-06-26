import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const { data, error } = await supabase.from("playlist_users").delete().eq("user_id", userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
