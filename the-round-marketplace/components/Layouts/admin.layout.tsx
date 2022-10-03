import { AppShell, Center, Loader, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import AdminFooter from "../Admin/Footer";
import AdminHeader from "../Admin/Header";
import AdminNavbar from "../Admin/Navbar";

export default function AdminLayout({ children }: React.PropsWithChildren<{}>) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const userData = useUserContext();
  const router = useRouter();

  useEffect(() => {
    console.log("AdminLayout: useEffect");
    console.log(userData);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.roles.includes("admin") || user.roles.includes("venue")) {
      return;
    }

    router.push("/");
  }, [userData, router]);

  if (
    userData?.user?.roles.includes("admin") ||
    userData?.user?.roles.includes("venue")
  ) {
    return (
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={<AdminNavbar opened={opened} />}
        footer={<AdminFooter />}
        header={
          <AdminHeader theme={theme} opened={opened} setOpened={setOpened} />
        }
      >
        <div>{children}</div>
      </AppShell>
    );
  }

  return (
    <Center>
      <Loader size="xl" />
    </Center>
  );
}
