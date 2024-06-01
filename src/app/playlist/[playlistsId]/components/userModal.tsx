// import React from "react";
// import { Modal } from "@mantine/core";

// type UserModalProps = {
//   username: string;
//   opened: boolean;
//   onClose: () => void;
//   follower: string;
//   following: string;
// };

// const UserModal: React.FC<UserModalProps> = (opened, username, followers, following) => {
//   return (
//     <Modal opened={opened} onClose={close} title={`${username}`} centered>
//       {/* username / follower, following / follow button → 클릭하면 바로 DB 반영 / playlist → 클릭하면 플레이리스트로 이동 */}
//       {/* user id : createdWith.find((user) => user.username === selectedUsername)?.id */}
//       <span>follower : </span>
//       {followers}
//       <span>&nbsp;</span>
//       <span>following : </span>
//       {following}
//     </Modal>
//   );
// };

// export default UserModal;
