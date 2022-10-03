/* eslint-disable react-hooks/exhaustive-deps */
import { Carousel } from "@mantine/carousel";
import {
  Box,
  Card,
  Center,
  Group,
  Image,
  SimpleGrid,
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
import ReactPlayer from "react-player";
import { Check } from "tabler-icons-react";
import CollabsibleText from "../../components/CollapsibleText/CollapsibleText.component";
import ListingSection, { ListingType } from "../../components/ListingSection";
import {
  fetchListingControllerClaimListing,
  useEventControllerFindOne,
} from "../../services/api/theRoundComponents";

const Event: NextPage = () => {
  const router = useRouter();
  const { slug, transactionHashes } = router.query;
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
  const { data, isLoading, error } = useEventControllerFindOne({
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
                src={data?.mediaUrl}
                withPlaceholder
                alt={data?.title}
              />
            </Card.Section>
          </Skeleton>
        </Card>
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

        <SimpleGrid
          cols={2}
          spacing="xs"
          breakpoints={[{ maxWidth: "sm", cols: 1, spacing: "sm" }]}
        >
          <Skeleton visible={isLoading}>
            {data && (
              <Box mt="xl">
                <Title order={3}>Start Date</Title>
                <Text size="xl" color="dimmed" lineClamp={1}>
                  {new Date(data?.startDate).toLocaleString()}
                </Text>
              </Box>
            )}
          </Skeleton>

          <Skeleton visible={isLoading}>
            {data && (
              <Box mt="xl">
                <Title order={3}>End Date</Title>
                <Text size="xl" color="dimmed" lineClamp={1}>
                  {new Date(data?.endDate).toLocaleString()}
                </Text>
              </Box>
            )}
          </Skeleton>
        </SimpleGrid>

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
              <ListingSection slug={data?.slug} type={ListingType.Ticket} />
            </Box>
          )}
        </Skeleton>

        <Skeleton visible={isLoading}>
          {data && (
            <Box mt="xl">
              <ListingSection
                slug={data?.slug}
                type={ListingType.Merchandise}
              />
            </Box>
          )}
        </Skeleton>

        <Skeleton visible={isLoading}>
          {data?.mediaUrls && data?.mediaUrls.length > 0 && (
            <Box mt="xl">
              <Title order={3}>Gallery</Title>
              <Carousel
                mt="md"
                slideSize="50%"
                slideGap="xs"
                align="start"
                breakpoints={[
                  { maxWidth: "sm", slideSize: "100%", slideGap: 2 },
                ]}
              >
                {data?.mediaUrls.map((url) => (
                  <Carousel.Slide key={url}>
                    <Image
                      radius="xs"
                      src={url}
                      alt={data?.title}
                      withPlaceholder
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            </Box>
          )}
        </Skeleton>

        <Skeleton visible={isLoading}>
          {data?.trailerUrl && (
            <Box mt="xl">
              <Title order={3}>Video</Title>
              <Center>
                <Card
                  mt="md"
                  p={0}
                  sx={{ width: "100%", aspectRatio: "16/9" }}
                  shadow="md"
                >
                  <ReactPlayer
                    width="auto"
                    height="100%"
                    url={data.trailerUrl}
                  />
                </Card>
              </Center>
            </Box>
          )}
        </Skeleton>
      </Stack>
    </Stack>
  );
};

export default Event;
