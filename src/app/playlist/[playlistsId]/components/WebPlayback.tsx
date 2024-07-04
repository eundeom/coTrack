import { useTokenState } from "@/app/context/token.provider";
import { useEffect, useState } from "react";

const WebPlayback = () => {
  //{ token }: { token: string }
  const { getAccessToken } = useTokenState();

  interface SpotifyPlayer extends Spotify.Player {}
  const [player, setPlayer] = useState<SpotifyPlayer | undefined>(undefined);

  useEffect(() => {
    const connectPlayer = async () => {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "Web Playback SDK",
          getOAuthToken: async (cb) => {
            cb(await getAccessToken());
          },
          volume: 0.5,
        });

        setPlayer(player);

        player.addListener("ready", ({ device_id }) => {
          console.log("The Web Playback SDK is ready to play music!");
          console.log("Device ID", device_id);
        });

        player.addListener("not_ready", ({ device_id }) => {
          console.log("Device ID has gone offline", device_id);
        });

        player.addListener("player_state_changed", (state) => {
          if (!state) {
            return;
          }
          // console.log(state);
          // setTrack(state.track_window.current_track);
          // setPaused(state.paused);
          // setPosition(state.position);
          // setDuration(state.duration);
        });

        player.connect().then((success) => {
          if (success) {
            console.log("The Web Playback SDK successfully connected to Spotify!");
          }
        });
      };
    };

    connectPlayer();
  }, [getAccessToken]);

  return (
    <>
      <div className="container">
        <div className="main-wrapper">{/* <h1>player</h1> */}</div>
      </div>
    </>
  );
};

export default WebPlayback;
