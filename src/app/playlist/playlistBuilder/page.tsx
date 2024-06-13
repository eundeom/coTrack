import PlaylistUploadComponent from "./components/main";
import { makeServerClient } from "@/utils/supabase/server";
import getRefreshToken from "@/utils/spotify/refreshToken";
import { useTokenState } from "@/app/context/token.provider";

interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

const PlaylistUploadPage = async () => {
  const supabase = makeServerClient();

  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData) {
    console.error(userError);
  }

  // get Access Token //
  // const access_token = getAccessToken();
  // console.log(access_token);
  // const getAccessToken = async () => {
  //   try {
  //     const res = await fetch(`https://accounts.spotify.com/api/token`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: "Basic " + btoa(client_id + ":" + client_secret),
  //         "Content-Type": "application/x-www-form-urlencoded",
  //       },
  //       body: "grant_type=client_credentials",
  //     });
  //     const data = await res.json();
  //     return data as Token;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  // const token = await getAccessToken();

  // get Refresh Token
  await getRefreshToken(userData.user!.id);

  return (
    <>
      <PlaylistUploadComponent />
    </>
  );
};
export default PlaylistUploadPage;
