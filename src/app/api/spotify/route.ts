import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST() {
  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const REDIRECT_URI = "http://localhost:3000/callback";
  const SCOPE = "user-read-private user-read-email";
  const state = randomBytes(16).toString("base64");

  const params = new URLSearchParams();
  params.set("response_type", "code");
  params.set("client_id", client_id);
  params.set("scope", SCOPE);
  params.set("redirect_uri", REDIRECT_URI);
  params.set("state", state);

  return NextResponse.json(
    "https://accounts.spotify.com/authorize?" + params.toString()
  );
}
