import { Center, Paper, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NextPage } from "next";
import { useRouter } from "next/router";
import ConnectAccount from "../../components/ConnectAccount";
import { useUserContext } from "../../context/UserContext";

const Login: NextPage = () => {
  const userData = useUserContext();
  const router = useRouter();
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);

  if (userData.user) {
    router.push("/");
  }

  return (
    <Center>
      <Paper
        mt="xl"
        radius="md"
        p="xl"
        withBorder
        sx={{ width: mobile ? "80%" : "30%" }}
      >
        <ConnectAccount />
      </Paper>
    </Center>
  );
};

export default Login;
