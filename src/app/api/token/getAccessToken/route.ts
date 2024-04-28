import { NextResponse } from "next/server";

interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function POST() {
  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  try {
    const res = await fetch(`https://accounts.spotify.com/api/token`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(client_id + ":" + client_secret),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch access token" });
    }

    const data = await res.json();
    return NextResponse.json(data as Token);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
