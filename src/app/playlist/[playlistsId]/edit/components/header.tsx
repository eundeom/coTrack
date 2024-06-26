import { Button, Flex } from "@mantine/core";
import { useRouter } from "next/navigation";

interface HeaderComponentProps {
  doneToEditPlaylist: () => void;
  deletePlaylist: () => void;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  doneToEditPlaylist,
  deletePlaylist,
}) => {
  const router = useRouter();

  return (
    <Flex justify="space-between" align="center" mb={60}>
      <Button variant="transparent" color="black" size="lg">
        <span
          onClick={() => {
            router.push("/playlist/main");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 6l-6 6l6 6" />
          </svg>
        </span>
      </Button>
      <h1 className="playlist-mini-title">Edit your own Playlist</h1>
      <div>
        <Button variant="filled" color="#FB00A3" size="md" radius="xl" onClick={deletePlaylist}>
          Delete
        </Button>
        <Button variant="filled" color="#FB00A3" size="md" radius="xl" onClick={doneToEditPlaylist}>
          Done
        </Button>
      </div>
    </Flex>
  );
};

export default HeaderComponent;
