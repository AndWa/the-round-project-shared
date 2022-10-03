/* eslint-disable react-hooks/rules-of-hooks */
import { Carousel } from "@mantine/carousel";
import { Box, Stack, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  useEventControllerFindAllMerchandise,
  useEventControllerFindAllTickets,
  useUserControllerOwnedNfts,
  useVenueControllerFindAllMerchandise,
  useVenueControllerFindVenuePass,
} from "../../services/api/theRoundComponents";
import { Listing } from "../../services/api/theRoundSchemas";
import useCarouselStyles from "../CarouselStyle";
import ListingCard from "./Card";

export enum ListingType {
  Ticket,
  Merchandise,
  VenuePass,
  VenueMerchandise,
  OwnedTickets,
  OwnedMerchandise,
  OwnedVenuePass,
}

interface ListingSectionProps {
  slug: string;
  type: ListingType;
}

const ListingSection = ({ slug, type }: ListingSectionProps) => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { classes } = useCarouselStyles();

  const getRequest = (type: ListingType) => {
    switch (type) {
      case ListingType.Ticket:
        return useEventControllerFindAllTickets({
          pathParams: {
            slug,
          },
        });
      case ListingType.Merchandise:
        return useEventControllerFindAllMerchandise({
          pathParams: {
            slug,
          },
        });
      case ListingType.VenuePass:
        return useVenueControllerFindVenuePass({
          pathParams: {
            slug,
          },
        });
      case ListingType.VenueMerchandise:
        return useVenueControllerFindAllMerchandise({
          pathParams: {
            slug,
          },
        });
      case ListingType.OwnedTickets:
      case ListingType.OwnedMerchandise:
      case ListingType.OwnedVenuePass:
        return useUserControllerOwnedNfts({});
    }
  };

  const getTitle = (type: ListingType) => {
    switch (type) {
      case ListingType.Ticket:
      case ListingType.OwnedTickets:
        return "Tickets";
      case ListingType.Merchandise:
      case ListingType.VenueMerchandise:
      case ListingType.OwnedMerchandise:
        return "Merchandise";
      case ListingType.VenuePass:
      case ListingType.OwnedVenuePass:
        return "Venue Passes";
    }
  };

  const { data, isLoading, isError } = getRequest(type);

  const actualData = (data: Listing[] | undefined) => {
    if (data === undefined) return [];

    switch (type) {
      case ListingType.OwnedTickets:
        return data.filter((listing) => listing.ticket !== null);
      case ListingType.OwnedMerchandise:
        return data.filter((listing) => listing.merchandise !== null);
      case ListingType.OwnedVenuePass:
        return data.filter((listing) => listing.venuePass !== null);
      default:
        return data;
    }
  };

  const slides = actualData(data)?.map((item) => (
    <Carousel.Slide key={item.title}>
      <ListingCard
        listing={item}
        owned={[
          ListingType.OwnedMerchandise,
          ListingType.OwnedTickets,
          ListingType.OwnedVenuePass,
        ].includes(type)}
      />
    </Carousel.Slide>
  ));

  return slides.length > 0 ? (
    <Stack>
      <Title order={3}>{getTitle(type)}</Title>
      <Carousel
        classNames={classes}
        slideSize="19.5%"
        slideGap="xl"
        align="start"
        breakpoints={[
          { maxWidth: "xs", slideSize: "100%", slideGap: 2 },
          { maxWidth: "sm", slideSize: "100%", slideGap: 2 },
          { maxWidth: "md", slideSize: "50%", slideGap: "xl" },
          { maxWidth: "lg", slideSize: "32.5%", slideGap: "xl" },
          { maxWidth: "xl", slideSize: "24.5%", slideGap: "xl" },
        ]}
      >
        {slides}
      </Carousel>
    </Stack>
  ) : (
    <Box></Box>
  );
};

export default ListingSection;
