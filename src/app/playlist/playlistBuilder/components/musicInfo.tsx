import { Button, TextInput, Flex } from "@mantine/core";
import { RefObject } from "react";

interface PlaylistInfoComponentProps {
  titleRef: RefObject<HTMLInputElement>;
  descriptionRef: RefObject<HTMLInputElement>;
  searchRef: RefObject<HTMLInputElement>;
  searchTrackHandler: () => void;
}

const PlaylistInfoComponent: React.FC<PlaylistInfoComponentProps> = ({
  titleRef,
  descriptionRef,
  searchRef,
  searchTrackHandler,
}) => {
  return (
    <>
      <Flex direction="column" mt={50}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: 6,
            width: 420,
          }}
        >
          <span style={{ width: 200, fontSize: 18 }}>
            <b>Playlist title</b>
          </span>
          <TextInput variant="filled" radius="lg" style={{ width: "100%" }} ref={titleRef} />
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: 6,
            width: 420,
          }}
        >
          <span style={{ width: 200, fontSize: 18 }}>
            <b>Description</b>
          </span>
          <TextInput variant="filled" radius="lg" style={{ width: "100%" }} ref={descriptionRef} />
        </div>

        {/* Create with */}
        {/* <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: 6,
            width: 505,
          }}
        >
          <span style={{ width: 135, fontSize: 18 }}>
            <b>Create with</b>
          </span>
          <TextInput variant="filled" radius="lg" style={{ width: "290px" }} />
          <Button variant="outline" color="rgba(168, 165, 165, 1)" radius="lg" ml={10}>
            Search
          </Button>
        </div> */}

        {/* Add Music */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: 6,
            width: 505,
          }}
        >
          <span style={{ width: 135, fontSize: 18 }}>
            <b>Add Music</b>
          </span>
          <TextInput variant="filled" radius="lg" style={{ width: "290px" }} ref={searchRef} />
          <Button
            variant="outline"
            color="rgba(168, 165, 165, 1)"
            radius="lg"
            ml={10}
            onClick={searchTrackHandler}
          >
            Search
          </Button>
        </div>
      </Flex>
    </>
  );
};
export default PlaylistInfoComponent;
