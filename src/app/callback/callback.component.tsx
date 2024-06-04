"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/Admin";
import { LoadingOverlay } from "@mantine/core";
import { useTokenState } from "../context/token.provider";
import { useUserState } from "../context/user.provider";

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

const CallbackComponent = ({ token }: { token: TokenData }) => {
  const router = useRouter();
  const { setAccessToken } = useTokenState();
  const { userId } = useUserState();

  const currentTime = new Date();
  const futureTime = new Date(currentTime.getTime() + 3300 * 1000);
  const futureTimeString = futureTime.toISOString();

  if (userId) {
    const setToken = async () => {
      const { error } = await supabase.from("token").insert({
        user_id: userId,
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expire_at: futureTimeString,
      });
      if (error) {
        // console.error(error);
      }
      setAccessToken(token.access_token);
    };
    setToken();
    router.push("/playlist/main");
  }

  return (
    <>
      <LoadingOverlay
        visible={true}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ color: "pink", type: "bars" }}
      />
    </>
  );
};
export default CallbackComponent;
