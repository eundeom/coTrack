import { Button } from "@mantine/core";

const AuthConfirmPage = ({
  searchParams,
}: {
  searchParams: { confirmUrl: string };
}) => {
  return (
    <>
      <Button component="a" href={searchParams.confirmUrl}>
        Click Here to confirm
      </Button>
    </>
  );
};
export default AuthConfirmPage;
