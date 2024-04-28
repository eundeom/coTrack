import { Accordion, Image, Flex, Text, Button } from "@mantine/core";

interface Track {
  id: string;
  name: string;
  album: string;
  artist: string;
  albumCover: string;
  duration: string;
}

interface SearchItemsComponentProps {
  tracks: Track[];
  addToPlaylist: (track: Track) => void;
}

const SearchItemsComponent: React.FC<SearchItemsComponentProps> = ({ tracks, addToPlaylist }) => {
  // searched song item -> display on the screen
  return (
    <Accordion transitionDuration={100} defaultValue={tracks.length > 0 ? tracks[0].id : undefined}>
      {tracks.map((track) => (
        <Accordion.Item key={track.id} value={track.id}>
          <Accordion.Control
            icon={<Image src={track.albumCover} width={30} height={30} alt="album cover" />}
          >
            {track.name} - {track.artist}
          </Accordion.Control>
          <Accordion.Panel>
            <Flex justify={"space-between"}>
              <Text>
                <strong>Album:</strong> {track.album}
              </Text>
              <Flex style={{ borderRadius: 100, backgroundColor: "#F9F9F9" }}>
                <Button
                  size="md"
                  variant="transparent"
                  onClick={() => addToPlaylist(track)}
                  color="pink"
                >
                  +
                </Button>
              </Flex>
            </Flex>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default SearchItemsComponent;
