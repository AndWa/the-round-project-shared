import { Carousel } from "@mantine/carousel";
import { Stack, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useUserContext } from "../../context/UserContext";
import { useVenueControllerFindAll } from "../../services/api/theRoundComponents";
import { Venue } from "../../services/api/theRoundSchemas";
import useCarouselStyles from "../CarouselStyle";
import VenueCard from "../Venue/Card";

export enum VenueType {
  All,
  Bookmarked,
}

interface VenuesSectionProps {
  type: VenueType;
}

const VenuesSection = ({ type }: VenuesSectionProps) => {
  const userData = useUserContext();
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  const { classes } = useCarouselStyles();

  const { data, isLoading, isError } = useVenueControllerFindAll({});

  const dataToUse = () => {
    switch (type) {
      case VenueType.All:
        return data;
      case VenueType.Bookmarked:
        return userData.user?.bookmarkedVenues as any as Venue[];
    }
  };

  const slides = dataToUse()?.map((item) => (
    <Carousel.Slide key={item.title}>
      <VenueCard
        title={item.title}
        image={item.logoUrl}
        category={item.shortDescription}
        venue={item}
      />
    </Carousel.Slide>
  ));

  const text = () => {
    switch (type) {
      case VenueType.All:
        return "Venues you'll love";
      case VenueType.Bookmarked:
        return "Bookmarked Venues";
    }
  };

  return (
    <Stack>
      <Text sx={{ fontSize: 32 }}>
        {type === VenueType.All && <b>Spotlight.</b>} {text()}
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

export default VenuesSection;
