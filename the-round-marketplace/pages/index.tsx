import { Box, Stack, Text, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import type { NextPage } from "next";
import Image from "next/image";
import hero from "../assets/hero-background.jpeg";
import CustomerHeader from "../components/Customer/Header";
import EventsSection, { EventType } from "../components/EventSection";
import SearchField from "../components/Search";
import VenuesSection, { VenueType } from "../components/VenuesSection";

const Home: NextPage = () => {
  const theme = useMantineTheme();
  const matches = useMediaQuery("(max-width: 768px)");
  const { height, width } = useViewportSize();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
  const xPadding = mobile ? 16 : 60;

  return (
    <Stack>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100vw",
          [`@media (max-width: ${theme.breakpoints.md}px)`]: {
            height: "50vh",
          },
          height: "80vh",
          minHeight: 600,
        }}
      >
        {theme.colorScheme === "light" && (
          <Box
            sx={{
              position: "absolute",
              overflow: "hidden",
            }}
          >
            <Image
              src={hero}
              width={width}
              height={height === 0 ? height : height < 600 ? 600 : height}
              objectFit="cover"
              objectPosition="center"
              alt="Hero background"
            />
          </Box>
        )}

        <Stack
          sx={{
            position: "relative",
            overflow: "hidden",
            height: "100%",
          }}
        >
          {!matches && (
            <CustomerHeader
              theme={theme}
              opened={false}
              setOpened={() => {}}
              hasHero
            />
          )}

          <Stack
            spacing="md"
            p={xPadding}
            sx={{
              marginTop: "auto",
              marginBottom: "auto",
              [`@media (max-width: ${theme.breakpoints.md}px)`]: {
                width: "100vw",
              },
              width: "50vw",
            }}
          >
            <Title
              order={1}
              sx={{
                fontSize: !matches ? 60 : 30,
                whiteSpace: "pre-line",
                lineHeight: 1,
              }}
            >
              {"THE FUTURE OF\n"}
              ENTERTAINMENT
            </Title>

            <Text size="xl">
              The Round is the world’s first Web 3.0 platform for live
              entertainment in Augmented Reality (AR), with unique virtual
              venues for broadcasting live intimate and multiplayer holographic
              performances and collecting exclusive NFTs and Meta-merch from
              your favourite creators.
            </Text>

            <Box sx={{ width: "80%" }}>
              <SearchField />
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Box px={xPadding} py="xl">
        <VenuesSection type={VenueType.All} />
        <Box my="xl"></Box>
        <EventsSection type={EventType.All} />
      </Box>
    </Stack>
  );
};

export default Home;
