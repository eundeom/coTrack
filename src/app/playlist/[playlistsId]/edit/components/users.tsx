import { Pill } from "@mantine/core";

type User = {
  user_id: string;
  users: {
    username: string;
  };
};
type PlaylistUsersComponentProps = {
  users: User[];
  creator: string | null;
  removeUsers: (userId: string) => Promise<void>;
};

const PlaylistUsersComponent: React.FC<PlaylistUsersComponentProps> = ({
  users,
  creator,
  removeUsers,
}) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          margin: 6,
          width: 420,
        }}
      >
        <span style={{ width: 135, fontSize: 18 }}>
          <b>Created by </b>
        </span>
        <span>
          {users.map((user, index) => (
            <div key={index} style={{ display: "inline-block" }}>
              {creator === user.user_id ? (
                <Pill>{user.users.username}</Pill>
              ) : (
                <Pill
                  withRemoveButton
                  onClick={() => {
                    removeUsers(user.user_id);
                  }}
                >
                  {user.users.username}
                </Pill>
              )}
              <span>&nbsp;</span>
            </div>
          ))}
        </span>
      </div>
    </>
  );
};
export default PlaylistUsersComponent;
