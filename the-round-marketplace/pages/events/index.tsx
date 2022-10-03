import { Box, SimpleGrid, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { NextPage } from "next";
import EventCard from "../../components/Event/Card";
import { useEventControllerFindAll } from "../../services/api/theRoundComponents";

const Events: NextPage = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
  const xPadding = mobile ? 16 : 60;

  const { data, isLoading, isError } = useEventControllerFindAll({});
  const items = data?.map((item) => (
    <EventCard
      key={item.title}
      title={item.title}
      image={item.mediaUrl}
      type={item.type}
      description={item.shortDescription}
      venue={item.venue}
      event={item}
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

export default Events;
