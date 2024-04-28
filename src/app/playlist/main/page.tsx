import "../playlist.css";
import { makeServerClient } from "@/utils/supabase/server";
import PlaylistComponent from "./components/main";

const PlaylistPage = async () => {
  const supabase = makeServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: Udata, error } = await supabase.from("users").select().eq("id", session!.user.id);

  return (
    <>
      <PlaylistComponent username={Udata ? Udata![0].username : null} />
    </>
  );
};

export default PlaylistPage;
