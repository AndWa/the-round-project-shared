import {
  Anchor,
  Button,
  Divider,
  Footer,
  Group,
  Input,
  MediaQuery,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NextLink } from "@mantine/next";
import Image from "next/image";
import { BrandApple, BrandGooglePlay } from "tabler-icons-react";
import qrCode from "../../../assets/qr-code.svg";

const CustomerFooter = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);

  return (
    <Footer
      height="auto"
      sx={{
        borderTop: theme.colorScheme === "dark" ? "" : "none",
        background:
          theme.colorScheme === "dark" ? theme.colors.dark[8] : "#f3f0e8",
      }}
    >
      <Group
        px={60}
        py={40}
        position="apart"
        sx={{
          flexDirection: mobile ? "column-reverse" : "row",
        }}
      >
        <Stack spacing="md">
          <MediaQuery largerThan="md" styles={{ display: "none" }}>
            <Divider my={24} />
          </MediaQuery>

          <Title
            order={1}
            sx={{
              whiteSpace: "pre-line",
              lineHeight: 1,
              textUnderlineOffset: 8,
            }}
          >
            {"STAY TUNED\n"}
            <u>FOR UPDATES</u>
          </Title>

          <Text>
            No fluff, just what you need to know. No spam. Never shared. Opt out
            at any time.
          </Text>

          <Input
            rightSection={
              <Button
                sx={{
                  height: "100%",
                  ":active": {
                    transform: "translateY(0px)",
                    filter: "brightness(2)",
                  },
                }}
              >
                SUBMIT
              </Button>
            }
            type="email"
            placeholder="Enter your email address..."
            radius="xs"
            size="lg"
            disabled={true}
          />
        </Stack>

        <Stack>
          <Group spacing="xl">
            <Title
              order={2}
              sx={{
                whiteSpace: "pre-line",
              }}
            >
              <b>{"Download our app\n"}</b>
              <Text weight={300}>for your mobile device.</Text>
            </Title>
            <Image
              src={qrCode}
              alt="The Round QR Code"
              height={76}
              width={76}
            />
          </Group>

          <Group spacing="md">
            <Button
              component={NextLink}
              href="https://apps.apple.com/gb/app/the-round/id1560213647"
              sx={{ width: 220 }}
              leftIcon={<BrandApple />}
              variant="outline"
              radius="xl"
              size="lg"
            >
              App Store
            </Button>
            <Button
              component={NextLink}
              href="https://play.google.com/store/apps/details?id=com.RealityCheck.TheRound&hl=en&gl=us"
              sx={{ width: 220 }}
              leftIcon={<BrandGooglePlay />}
              variant="outline"
              radius="xl"
              size="lg"
            >
              Google Play
            </Button>
          </Group>
        </Stack>
      </Group>

      <Divider />

      <Group px={60} py={16} position="apart">
        <Text>ⓒ 2022 The Round, Inc. All rights reserved.</Text>

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

export default CustomerFooter;
