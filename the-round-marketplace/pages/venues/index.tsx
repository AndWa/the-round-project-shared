import { Box, SimpleGrid, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NextPage } from "next";
import VenueCard from "../../components/Venue/Card";
import { useVenueControllerFindAll } from "../../services/api/theRoundComponents";

const Venues: NextPage = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
  const xPadding = mobile ? 16 : 60;

  const { data, isLoading, isError } = useVenueControllerFindAll({});
  const items = data?.map((item) => (
    <VenueCard
      key={item.title}
      title={item.title}
      image={item.logoUrl}
      category={item.shortDescription}
      venue={item}
    />
  ));

  return (
    <Box px={xPadding} py="xl">
      <SimpleGrid
        cols={5}
        spacing="xl"
        breakpoints={[
          { maxWidth: "sm", cols: 1 },
          { maxWidth: "md", cols: 2, spacing: "xl" },
          { maxWidth: "lg", cols: 3, spacing: "xl" },
          { maxWidth: "xl", cols: 4, spacing: "xl" },
        ]}
      >
        {items}
      </SimpleGrid>
    </Box>
  );
};

export default Venues;
