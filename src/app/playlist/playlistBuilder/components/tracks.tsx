import { Flex, Image, Text, CloseButton, Grid } from "@mantine/core";

interface Track {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
}

interface PlaylistItemsComponentProps {
  playlist: Track[];
  removeFromPlaylist: (trackId: string) => void;
}

const PlaylistItemsComponent: React.FC<PlaylistItemsComponentProps> = ({
  playlist,
  removeFromPlaylist,
}) => {
  // songs to add to playlist -> show on screen
  return (
    <>
      {playlist.map((track) => (
        <div key={track.id}>
          <hr style={{ border: "solid 0.1px #dddddd", margin: 20 }} />
          <div className="add-music-item">
            <Grid className="add-music-title" align="center" ml={50}>
              <Grid.Col span={1.5}>
                <Image
                  radius="lg"
                  src={track.albumCover}
                  alt={`Playlist`}
                  w={80}
                  h={80}
                  // ml={60}
                />
              </Grid.Col>
              <Grid.Col span={3}>{track.name}</Grid.Col>
              <Grid.Col span={3}>{track.artist}</Grid.Col>
              <Grid.Col span={3}>{track.duration}</Grid.Col>
              <Grid.Col span={1}>
                <CloseButton
                  size="sm"
                  variant="transparent"
                  onClick={() => removeFromPlaylist(track.id)}
                />
              </Grid.Col>
            </Grid>
          </div>
        </div>
      ))}
    </>
  );
};

export default PlaylistItemsComponent;
