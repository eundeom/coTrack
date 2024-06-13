import "server-only";
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

export async function GET(req: NextRequest) {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirect_uri = `${req.nextUrl.origin}/api/spotify`;

  const code = req.nextUrl.searchParams.get("code")!;

  const params = new URLSearchParams();
  params.set("code", code);
  params.set("redirect_uri", redirect_uri);
  params.set("grant_type", "authorization_code");

  const data: TokenData = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: params.toString(),
  }).then((res) => res.json());

  const authSupabase = makeServerClient();

  const currentTime = new Date();
  const futureTime = new Date(currentTime.getTime() + (data.expires_in - 300) * 1000);
  const futureTimeString = futureTime.toISOString();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));

  await supabase.from("token").insert({
    user_id: user.id,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expire_at: futureTimeString,
  });

  return NextResponse.redirect(new URL("/playlist/main", req.url));
}
