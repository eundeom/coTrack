// import { supabase } from "../supabase/admin";

// // get Refresh Token //
// const getRefreshToken = async (userId: string) => {
//   const client_id = process.env.SPOTIFY_CLIENT_ID!;
//   const client_secret = process.env.SPOTIFY_CLIENT_SECRET!;

//   const refreshHandler = async (userId: string) => {
//     const { data: TokenData, error } = await supabase.from("token").select();

//     const refreshToken = TokenData![0].refresh_token;

//     const params = new URLSearchParams();
//     params.set("refresh_token", refreshToken);
//     params.set("grant_type", "refresh_token");

//     const response = await fetch("https://accounts.spotify.com/api/token", {
//       method: "POST",
//       headers: {
//         "content-type": "application/x-www-form-urlencoded",
//         Authorization: "Basic " + Buffer.from(client_id + ":" + client_secret).toString("base64"),
//       },
//       body: params.toString(),
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log("d", data);
//       const access_token = data.access_token;
//       console.log("Access Token:", access_token);

//       // DB UPDATE
//       const currentTime = new Date();

//       const createdAt = new Date().toISOString();
//       const futureTime = new Date(currentTime.getTime() + 3300 * 1000); // 현재 시간에 3300초를 더함
//       const futureTimeString = futureTime.toISOString();

//       const { error } = await supabase
//         .from("token")
//         .update({
//           access_token,
//           created_at: createdAt,
//           expire_at: futureTimeString,
//         })
//         .eq("user_id", userId);
//       if (error) {
//         console.error(error);
//       }
//     }
//   };

//   const { data: TokenExpireAt, error: TokenError } = await supabase
//     .from("token")
//     .select("expire_at")
//     .eq("user_id", userId);

//   const expireAt = new Date(TokenExpireAt![0].expire_at!);
//   const currentTime = new Date();

//   if (currentTime >= expireAt) {
//     await refreshHandler(userId);
//     console.log("refresh");
//   } else {
//     console.log("No refresh needed.");
//   }
// };

// export default getRefreshToken;
