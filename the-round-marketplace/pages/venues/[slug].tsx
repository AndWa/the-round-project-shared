/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Card,
  Group,
  Image,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDocumentTitle, useMediaQuery } from "@mantine/hooks";
import { providers } from "near-api-js";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Check } from "tabler-icons-react";
import CollabsibleText from "../../components/CollapsibleText/CollapsibleText.component";
import EventsForVenueSection from "../../components/EventsForVenueSection";
import ListingSection, { ListingType } from "../../components/ListingSection";
import {
  fetchListingControllerClaimListing,
  useVenueControllerFindOne,
} from "../../services/api/theRoundComponents";

const Venue: NextPage = () => {
  const router = useRouter();
  const { slug, transactionHashes } = router.query;
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
  const { data, isLoading, error } = useVenueControllerFindOne({
    pathParams: {
      slug: slug as string,
    },
  });
  const xPadding = mobile ? 16 : 120;
  useDocumentTitle(data?.title ?? "The Round");

  // TODO: Remove when switching to Webhooks
  const provider = new providers.JsonRpcProvider(
    "https://archival-rpc.testnet.near.org"
  );

  useEffect(() => {
    console.log("transactionHashes", transactionHashes);

    const getTransactionStatus = async (hash: string, accountId: string) => {
      const tx = await provider.txStatus(hash, "round.testnet");
      const log = JSON.parse(
        tx.receipts_outcome[0].outcome.logs[1].split("EVENT_JSON:")[1]
      );

      const tokenSeriesId = log.data.token_series_id;
      await fetchListingControllerClaimListing({
        pathParams: {
          tokenSeriesId,
        },
      });
      router.push(`${router.asPath.split("?")[0]}?success=true`);
    };

    if (!localStorage.getItem("user")) return;

    const accountId = (JSON.parse(localStorage.getItem("user")!) as any)
      .nearWalletAccountId;

    console.log("accountId", accountId);

    if (transactionHashes && accountId) {
      getTransactionStatus(transactionHashes as string, accountId);
    }
  }, [transactionHashes]);

  return (
    <Stack>
      <Box sx={{ height: 300, position: "relative" }}>
        <Image
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            objectFit: "cover",
            objectPosition: "center",
          }}
          height={200}
          width="100vw"
          src={data?.bannerUrl}
          withPlaceholder
          alt={data?.title}
          placeholder={<Skeleton visible={isLoading} height={200} />}
        />

        <Card
          sx={{
            position: "absolute",
            top: 100,
            left: mobile ? 0 : xPadding,
            right: mobile ? 0 : "auto",
            margin: "auto",
            width: 200,
          }}
          p={0}
          radius="xs"
          withBorder
        >
          <Skeleton visible={isLoading}>
            <Card.Section>
              <Image
                height={200}
                width={200}
                src={data?.logoUrl}
                withPlaceholder
                alt={data?.title}
              />
            </Card.Section>
          </Skeleton>
        </Card>

        {/* <Paper
          sx={{ position: "absolute", top: 250, right: mobile ? 0 : xPadding }}
          withBorder
          ml="auto"
          radius="xs"
          p="xl"
        >
          <ThemeIcon
            size="xl"
            radius="md"
            variant="gradient"
            gradient={{ deg: 0, from: "pink", to: "orange" }}
          >
            <ColorSwatch size={28} />
          </ThemeIcon>
          <Text size="xl" weight={500} mt="md">
            Buy Venue Pass
          </Text>
          <Text size="sm" mt="sm" color="dimmed">
            Gives you access to all events at this venue
          </Text>
          <Button fullWidth size="md" mt="xl" radius="xl">
            Buy
          </Button>
        </Paper> */}
      </Box>

      <Stack px={xPadding} py="xl" pt={16}>
        <Skeleton visible={isLoading}>
          <Group spacing={8}>
            <Title>{data?.title}</Title>
            <ThemeIcon radius="xl" size="md" color="blue">
              <Check size={18} />
            </ThemeIcon>
          </Group>
        </Skeleton>
        <Skeleton visible={isLoading}>
          <Text size="xl" color="dimmed" lineClamp={1}>
            {data?.shortDescription}
          </Text>
        </Skeleton>
        <Skeleton visible={isLoading}>
          {data && (
            <Box mt="xl">
              <Title order={3}>Description</Title>
              <CollabsibleText characterLimit={80}>
                {data?.longDescription}
              </CollabsibleText>
            </Box>
          )}
        </Skeleton>

        <Skeleton visible={isLoading}>
          {data && (
            <Box mt="xl">
              <ListingSection slug={data?.slug} type={ListingType.VenuePass} />
            </Box>
          )}
        </Skeleton>

        <Skeleton visible={isLoading}>
          {data && (
            <Box mt="xl">
              <ListingSection
                slug={data?.slug}
                type={ListingType.VenueMerchandise}
              />
            </Box>
          )}
        </Skeleton>

        <Skeleton visible={isLoading}>
          {data && (
            <Box mt="xl">
              <EventsForVenueSection venueSlug={data?.slug} />
            </Box>
          )}
        </Skeleton>
      </Stack>
    </Stack>
  );
};

export default Venue;
