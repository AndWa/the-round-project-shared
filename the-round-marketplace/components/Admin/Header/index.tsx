import {
  Box,
  Burger,
  Header,
  MantineTheme,
  MediaQuery,
  Text,
} from "@mantine/core";
import Image from "next/image";
import { SetStateAction } from "react";
import logo from "../../../assets/tr-logo.png";
import ThemeTogglerButton from "../../ThemeTogglerButton";
export interface AdminHeaderProps {
  theme: MantineTheme;
  opened: boolean;
  setOpened: (value: SetStateAction<boolean>) => void;
}

const AdminHeader = ({ theme, opened, setOpened }: AdminHeaderProps) => {
  return (
    <Header height={70} p="md">
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
        <Text ml={16}>Admin Dashboard</Text>

        <Box ml="auto">
          <ThemeTogglerButton />
        </Box>
      </div>
    </Header>
  );
};

export default AdminHeader;
