import { Divider, Navbar } from "@mantine/core";
import { useUserContext } from "../../../context/UserContext";
import Header from "./Header.component";
import { AdminSectionLinks, BottomLinks, VenueLinks } from "./Links.component";

export interface AdminNavbarProps {
  opened: boolean;
}

const AdminNavbar = ({ opened }: AdminNavbarProps) => {
  const userData = useUserContext();
  return (
    <Navbar
      p="md"
      hiddenBreakpoint="sm"
      hidden={!opened}
      width={{ sm: 200, lg: 300 }}
    >
      <Navbar.Section>
        <Header />
      </Navbar.Section>
      <Divider />
      <Navbar.Section grow mt="md">
        <VenueLinks />
      </Navbar.Section>
      {userData.user && userData.user.roles.includes("admin") && (
        <Navbar.Section>
          <AdminSectionLinks />
        </Navbar.Section>
      )}
      <Navbar.Section>
        <BottomLinks />
      </Navbar.Section>
    </Navbar>
  );
};

export default AdminNavbar;
