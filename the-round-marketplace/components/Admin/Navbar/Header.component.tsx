import {
  ActionIcon,
  Button,
  CopyButton,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { utils } from "near-api-js";
import Image from "next/image";
import { useEffect, useState } from "react";
import { QuestionMark, Refresh } from "tabler-icons-react";
import NearCoinSvg from "../../../assets/near-coin.svg";
import { useWalletSelector } from "../../../context/WalletSelectorContext";

const Header = () => {
  const getCurrentNearPrice: () => Promise<number> = async () => {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=NEAR&vs_currencies=USD"
    );

    return data.near.usd as number;
  };

  const [balance, setBalance] = useState<string | null>(null);
  const { accountId, account, refreshAccountData } = useWalletSelector();
  const theme = useMantineTheme();
  const { data, refetch } = useQuery(["near_price"], getCurrentNearPrice);

  useEffect(() => {
    if (account) {
      account?.getAccountBalance().then((nextBalance) => {
        setBalance(nextBalance.available);
      });
    }
  }, [account]);

  return (
    <Stack spacing={4} align="center" py={8}>
      <Image src={NearCoinSvg} height={30} width={30} alt="Near Logo" />

      <CopyButton value={accountId ?? ""}>
        {({ copied, copy }) => (
          <Button variant="subtle" color={copied ? "teal" : ""} onClick={copy}>
            <Text size="lg">{copied ? "Copied account id" : accountId}</Text>
          </Button>
        )}
      </CopyButton>

      <Text align="center" size="md" weight={500}>
        {utils.format.formatNearAmount(balance ?? "0", 2)} NEAR
      </Text>
      {data && (
        <Group position="center" spacing="sm">
          <Text size="sm" color="dimmed">
            ≈ $
            {(
              parseFloat(utils.format.formatNearAmount(balance ?? "0", 2)) *
              data
            ).toFixed(2)}{" "}
            <span>USD</span>
          </Text>
          <Tooltip label={`1 NEAR = $${data} USD`} position="right">
            <ThemeIcon variant="outline" size="xs" radius="xl">
              <QuestionMark />
            </ThemeIcon>
          </Tooltip>
        </Group>
      )}

      <ActionIcon
        mt={8}
        color={theme.primaryColor}
        variant="light"
        size="md"
        radius="md"
        onClick={() => {
          refetch();
          refreshAccountData();
        }}
      >
        <Refresh size={18} />
      </ActionIcon>
    </Stack>
  );
};

export default Header;
