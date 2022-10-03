import {
  ActionIcon,
  Box,
  Burger,
  Group,
  Header,
  MantineTheme,
  MediaQuery,
} from "@mantine/core";
import Image from "next/image";
import { useRouter } from "next/router";
import { SetStateAction } from "react";
import { User } from "tabler-icons-react";
import logo from "../../../assets/tr-logo.png";
import { useUserContext } from "../../../context/UserContext";
import { customerLinks, TextLink } from "../../TextLink";
import ThemeTogglerButton from "../../ThemeTogglerButton";

export interface CustomerHeaderProps {
  theme: MantineTheme;
  opened: boolean;
  setOpened: (value: SetStateAction<boolean>) => void;
  hasHero?: boolean;
}

const CustomerHeader = ({
  theme,
  opened,
  setOpened,
  hasHero,
}: CustomerHeaderProps) => {
  const userData = useUserContext();
  const router = useRouter();
  const onLoginClick = () => {
    router.push("/login");
  };

  return (
    <Header
      height={120}
      px={60}
      sx={{
        background: hasHero
          ? "transparent"
          : theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : "#faf9f6",
        borderBottom: hasHero ? "0" : "",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>

        <Image src={logo} alt="The Round Logo" height={40} width={40} />

        <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
          <Group ml="auto">
            {customerLinks.map((link) => (
              <TextLink key={link.label} {...link} />
            ))}

            {!userData.user && (
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                color="dark"
                onClick={onLoginClick}
              >
                <User />
              </ActionIcon>
            )}

            {userData.user && <TextLink href="/account" label="Account" />}

            {(userData.roles.includes("admin") ||
              userData.roles.includes("venue")) && (
              <TextLink href="/admin" label="Admin" />
            )}

            {/* <MediaQuery smallerThan="md" styles={{ display: "none" }}>
              <Input
                mx={16}
                rightSection={<Search />}
                placeholder="Search for your journey..."
                radius="xs"
                size="lg"
              />
            </MediaQuery> */}

            <Box ml="auto">
              <ThemeTogglerButton />
            </Box>
          </Group>
        </MediaQuery>

        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Group ml="auto">
            {!userData.user && (
              <ActionIcon
                size="xl"
                radius="xl"
                variant="filled"
                color="dark"
                onClick={onLoginClick}
              >
                <User />
              </ActionIcon>
            )}
            <ThemeTogglerButton />
          </Group>
        </MediaQuery>
      </div>
    </Header>
  );
};

export default CustomerHeader;
