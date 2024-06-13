import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { userId, selectedUserId } = await req.json();

  const { data, error } = await supabase
    .from("followers")
    .select("*")
    .eq("user_id", userId as string)
    .eq("follow", selectedUserId as string);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
