import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { username, userId } = await req.json();

  const { data, error } = await supabase.from("users").insert(username).eq("id", userId).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
