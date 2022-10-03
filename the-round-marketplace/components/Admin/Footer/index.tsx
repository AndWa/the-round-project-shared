import { Anchor, Footer, Group, Text } from "@mantine/core";

const AdminFooter = () => {
  return (
    <Footer height={60} p="md">
      <Group position="apart">
        <Text>The Round 2022</Text>

        <Text size="sm" color="dimmed">
          Prices powered by{" "}
          <Anchor href="https://www.coingecko.com/en/api" target="_blank">
            CoinGecko
          </Anchor>
        </Text>
      </Group>
    </Footer>
  );
};

export default AdminFooter;
