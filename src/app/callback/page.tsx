import "server-only";
import CallbackComponent from "./callback.component";
import { makeServerClient } from "@/utils/supabase/server";

const CallbackPage = async ({ searchParams: { code } }: any) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID!;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

  const params = new URLSearchParams();
  params.set("code", code);
  params.set("redirect_uri", "http://localhost:3000/callback");
  params.set("grant_type", "authorization_code");

  const data = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: params.toString(),
  }).then((res) => res.json());

  console.log("token", data);

  // // user id from supabase
  // const supabase = makeServerClient();

  // const { data: Udata, error } = await supabase.auth.getSession();
  // if (!Udata) {
  //   console.error(error);
  // }
  // console.log("Udata", Udata.session?.user.id);

  return (
    <>
      <CallbackComponent token={data} />
    </>
  );
};

export default CallbackPage;
