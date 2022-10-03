import { Carousel } from "@mantine/carousel";
import { Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useUserContext } from "../../context/UserContext";
import { useEventControllerFindAll } from "../../services/api/theRoundComponents";
import { Event } from "../../services/api/theRoundSchemas";
import useCarouselStyles from "../CarouselStyle";
import EventCard from "../Event/Card";

export enum EventType {
  All,
  Bookmarked,
}

interface EventsSectionProps {
  type: EventType;
}

const EventsSection = ({ type }: EventsSectionProps) => {
  const userData = useUserContext();
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { classes } = useCarouselStyles();
  const { data, isLoading, isError } = useEventControllerFindAll({});

  const dataToUse = () => {
    switch (type) {
      case EventType.All:
        return data;
      case EventType.Bookmarked:
        return userData.user?.bookmarkedEvents as any as Event[];
    }
  };

  const slides = dataToUse()?.map((item) => (
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

  const text = () => {
    switch (type) {
      case EventType.All:
        return "Events you'll love";
      case EventType.Bookmarked:
        return "Bookmarked Events";
    }
  };

  return (
    <Stack>
      <Text sx={{ fontSize: 32 }}>
        {type === EventType.All && <b>Spotlight.</b>} {text()}
      </Text>
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

export default EventsSection;
