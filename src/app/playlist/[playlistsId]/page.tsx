import "server-only";
import getRefreshToken from "@/utils/spotify/refreshToken";
import PlaylistsComponent from "./components/playlist";
import { makeServerClient } from "@/utils/supabase/server";

const PlaylistsPage = async ({ params: { playlistsId } }: { params: { playlistsId: string } }) => {
  const supabase = makeServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData) {
    console.error(userError);
  }

  // get Refresh Token
  await getRefreshToken(userData.user!.id);

  return (
    <>
      <PlaylistsComponent
        playlistsId={playlistsId}
        // userId={userData.user!.id}
      />
    </>
  );
};

export default PlaylistsPage;
