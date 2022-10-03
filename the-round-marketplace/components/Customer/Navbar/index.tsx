import { Navbar, Stack, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { SetStateAction, useEffect } from "react";
import { useUserContext } from "../../../context/UserContext";
import { customerLinks, TextLink } from "../../TextLink";

export interface CustomerNavbarProps {
  opened: boolean;
  setOpened: (value: SetStateAction<boolean>) => void;
}

const CustomerNavbar = ({ opened, setOpened }: CustomerNavbarProps) => {
  const theme = useMantineTheme();
  const userData = useUserContext();
  const router = useRouter();

  useEffect(() => {
    setOpened(false);
  }, [router.asPath, setOpened]);

  return (
    <Navbar
      sx={{
        height: "90vh",
        display: opened ? "flex" : "none",
        background:
          theme.colorScheme === "dark" ? theme.colors.dark[8] : "#faf9f6",
      }}
      px={60}
      pt={32}
    >
      {/* <Text
        sx={{
          position: "absolute",
          fontSize: 100,
          transform: "rotate(-90deg)",
          width: "90vh",
          lineHeight: 1,
          top: "30%",
          left: "-10%",
          height: "fit-content",
        }}
        weight={500}
        color="gray.1"
      >
        THE ROUND
      </Text> */}
      <Stack>
        {customerLinks.map((link) => (
          <TextLink key={link.label} {...link} />
        ))}
        {userData.user && <TextLink href="/account" label="Account" />}
        {(userData.roles.includes("admin") ||
          userData.roles.includes("venue")) && (
          <TextLink href="/admin" label="Admin" />
        )}
      </Stack>
    </Navbar>
  );
};

export default CustomerNavbar;
