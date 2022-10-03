import { Box, Button, Group, Text, useMantineTheme } from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { openModal } from "@mantine/modals";
import { utils } from "near-api-js";
import { useEffect, useState } from "react";
import { Qrcode } from "tabler-icons-react";
import { useUserContext } from "../../context/UserContext";
import { useWalletSelector } from "../../context/WalletSelectorContext";
import OtpGenerator from "../OtpGenerator";

const UserBanner = () => {
  const userData = useUserContext();
  const theme = useMantineTheme();
  const [balance, setBalance] = useState<string | null>(null);
  const { account, selector } = useWalletSelector();
  const os = useOs();

  useEffect(() => {
    if (!account) {
      return;
    }
    async function fetchMyAPI() {
      console.log("fetchMyAPI");
      const response = await account?.getAccountBalance();
      if (response) {
        console.log("Got balance", response);
        setBalance(response?.available);
      }
    }

    fetchMyAPI();
  }, [account]);

  const onSignOut = async () => {
    if (userData.user?.accountType === "near") {
      const wallet = await selector.wallet();

      wallet
        .signOut()
        .then(() => {
          userData.onSignOut();
        })
        .catch((err) => {
          console.log("Failed to sign out");
          console.error(err);
        });
    } else {
      userData.onSignOut();
    }
  };

  const onMobileAppLogin = async () => {
    openModal({
      title: ["ios", "android"].includes(os)
        ? "Enter one time code in The Round app"
        : "Scan QR code with The Round app",
      children: <OtpGenerator />,
    });
  };

  return (
    <Box px="xl" sx={{ height: "auto", background: theme.colors.dark[9] }}>
      <Group position="apart">
        <Button
          sx={{ background: theme.colors.dark[9] }}
          leftIcon={<Qrcode />}
          onClick={onMobileAppLogin}
        >
          Mobile App Login
        </Button>

        <Text size="xl" color="white">
          {userData.user?.username}
        </Text>
        <Group>
          {userData.user?.accountType === "near" && (
            <Text size="xl" color="white">
              {utils.format.formatNearAmount(balance ?? "0", 2)} NEAR
            </Text>
          )}
          <Button sx={{ background: theme.colors.dark[9] }} onClick={onSignOut}>
            Sign Out
          </Button>
        </Group>
      </Group>
    </Box>
  );
};

export default UserBanner;
