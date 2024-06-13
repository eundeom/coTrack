import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  const { type, userId, selectedUserId } = await req.json();

  switch (type) {
    case "delete":
      const { data: deleteData, error: deleteError } = await supabase
        .from("followers")
        .delete()
        .eq("user_id", userId as string)
        .eq("follow", selectedUserId);

      if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
      return NextResponse.json({ deleteData });

    case "insert":
      const { data: insertData, error: insertError } = await supabase
        .from("followers")
        .insert({ user_id: userId as string, follow: selectedUserId });

      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
      return NextResponse.json({ insertData });

    default:
      break;
  }
}
