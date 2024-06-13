import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";
import { makeServerClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const authSupabase = makeServerClient();
  const { error: authError } = await authSupabase.auth.signOut();
  if (authError) return NextResponse.json("no user", { status: 401 });

  const { data, error } = await supabase
    .from("token")
    .delete()
    .eq("user_id", userId as string);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
