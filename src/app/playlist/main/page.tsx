import "../playlist.css";
import { makeServerClient } from "@/utils/supabase/server";
import PlaylistComponent from "./components/main";

const PlaylistPage = async () => {
  // const supabase = makeServerClient();
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) {
  //   return <PlaylistComponent username={null} />;
  // }

  // const { data: Udata } = await supabase.from("users").select().eq("id", user.id);

  return (
    <>
      <PlaylistComponent />
    </>
  );
};

export default PlaylistPage;
