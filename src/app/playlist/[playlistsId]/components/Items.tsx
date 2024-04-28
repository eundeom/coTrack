import { Flex, Image, Text, CloseButton } from "@mantine/core";

interface Track {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
}

interface PlaylistItemsComponentProps {
  tracks: Track[];
}

const PlaylistItemsComponent: React.FC<PlaylistItemsComponentProps> = ({ tracks }) => {
  return (
    <>
      {tracks.map((track) => (
        <div key={track.id}>
          <hr style={{ border: "solid 0.1px #dddddd", margin: 20 }} />
          <div className="add-music-item">
            <Flex direction="row">
              <Image radius="lg" src={track.albumCover} alt={`Playlist`} w={80} h={80} ml={60} />
              <Flex className="add-music-title" align="center" ml={70}>
                <Text>{track.name}</Text>
                <Text ml={200}>{track.artist}</Text>
                <Text ml={280} mr={20}>
                  {track.duration}
                </Text>
              </Flex>
            </Flex>
          </div>
        </div>
      ))}
    </>
  );
};

export default PlaylistItemsComponent;