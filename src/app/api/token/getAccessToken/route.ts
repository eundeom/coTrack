import { supabase } from "@/utils/supabase/admin";
import { makeServerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const authSupabase = makeServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  if (!user) return NextResponse.json("no user", { status: 401 });

  const { data, error } = await supabase.from("token").select("*").eq("user_id", user.id).single();
  console.log("data", data);

  return NextResponse.json(data);
}
