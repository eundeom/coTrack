import { supabase } from "@/utils/supabase/admin";
import { makeServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}
export async function POST(req: NextRequest) {
  const authSupabase = makeServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));

  const { data: tokenData } = await supabase.from("token").select().eq("user_id", user.id).single();

  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", tokenData!.refresh_token);

  const data: TokenData = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: params.toString(),
  }).then((res) => res.json());

  const currentTime = new Date();
  const futureTime = new Date(currentTime.getTime() + (data.expires_in - 300) * 1000);
  const futureTimeString = futureTime.toISOString();

  const returnData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expire_at: futureTimeString,
  };
  await supabase.from("token").update(returnData).eq("id", tokenData!.id);

  return NextResponse.json(returnData);
}
