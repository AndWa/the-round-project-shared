import { Carousel } from "@mantine/carousel";
import { Stack, Title, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useVenueControllerFindEvents } from "../../services/api/theRoundComponents";
import useCarouselStyles from "../CarouselStyle";
import EventCard from "../Event/Card";

export interface EventsForVenueSectionProps {
  venueSlug: string;
}

const EventsForVenueSection = ({ venueSlug }: EventsForVenueSectionProps) => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { classes } = useCarouselStyles();
  const { data, isLoading, isError } = useVenueControllerFindEvents({
    pathParams: {
      slug: venueSlug,
    },
  });

  const slides = data?.map((item) => (
    <Carousel.Slide key={item.title}>
      <EventCard
        title={item.title}
        image={item.mediaUrl}
        type={item.type}
        venue={item.venue}
        description={item.shortDescription}
        event={item}
      />
    </Carousel.Slide>
  ));

  return (
    <Stack>
      {(data?.length ?? 0) > 0 && <Title order={3}>Events</Title>}
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
  );
};

export default EventsForVenueSection;
