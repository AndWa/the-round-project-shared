import {
  AppShell,
  Box,
  MediaQuery,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import CustomerFooter from "../Customer/Footer";
import CustomerHeader from "../Customer/Header";
import CustomerNavbar from "../Customer/Navbar";
import UserBanner from "../UserBanner";

export default function CustomerLayout({
  children,
}: React.PropsWithChildren<{}>) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  const matches = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const userData = useUserContext();
  const { height, width } = useViewportSize();

  useEffect(() => {
    if (!matches) {
      setOpened(false);
    }
  }, [matches]);

  const userBanner = userData.user && <UserBanner />;

  return (
    <AppShell
      fixed={false}
      styles={{
        main: {
          padding: 0,
          display: opened ? "none" : "",
          paddingBottom: 0,
          paddingTop: 0,
          background:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : "#faf9f6",
        },
      }}
      navbar={<CustomerNavbar opened={opened} setOpened={setOpened} />}
      footer={<CustomerFooter />}
      header={
        <Stack spacing={0}>
          {userBanner}
          {router.pathname !== "/" || opened || matches ? (
            <div>
              <CustomerHeader
                theme={theme}
                opened={opened}
                setOpened={setOpened}
              />
            </div>
          ) : (
            <></>
          )}
        </Stack>
      }
    >
      <Box
        sx={{
          minHeight: `calc(100vh - ${"550px"})`,
        }}
      >
        {children}
      </Box>
      <MediaQuery smallerThan="md" styles={{ display: "none" }}>
        {/* <Box
          sx={{
            position: "relative",
            height: 240,
            mx: "auto",
            overflow: "hidden",
          }}
        >
          <Image src={roundText} objectFit="contain" width={width * 0.8} />
        </Box> */}
        <Text
          sx={{
            fontSize: 200,
            lineHeight: "160px",
            height: 120,
            textAlign: "center",
            overflow: "hidden",
          }}
          weight={500}
          color="gray.2"
        >
          The Round
        </Text>
      </MediaQuery>
    </AppShell>
  );
}
