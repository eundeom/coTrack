import { makeServerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = makeServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch user" });
  }

  if (user) {
    return NextResponse.json(user.id);
  } else {
    return NextResponse.json({ error: "User not authenticated" });
  }
}
