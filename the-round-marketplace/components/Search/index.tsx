import { Autocomplete, Button, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useState } from "react";
import { Search } from "tabler-icons-react";
import {
  useEventControllerFindAll,
  useVenueControllerFindAll,
} from "../../services/api/theRoundComponents";

const SearchField = () => {
  const [value, setValue] = useState<{
    value: string;
    slug: string;
    type: string;
    group: string;
  } | null>(null);
  const matches = useMediaQuery("(max-width: 768px)");
  const {
    data: eventData,
    isLoading,
    error,
    refetch,
  } = useEventControllerFindAll({});
  const {
    data: venueData,
    isLoading: venueLoading,
    error: venueError,
    refetch: venueRefetch,
  } = useVenueControllerFindAll({});

  const router = useRouter();

  return (
    <Autocomplete
      data={[
        ...(eventData?.map((event) => ({
          value: event.title,
          slug: event.slug,
          type: "event",
          group: "Events",
        })) ?? []),
        ...(venueData?.map((venue) => ({
          value: venue.title,
          slug: venue.slug,
          type: "venue",
          group: "Venues",
        })) ?? []),
      ]}
      rightSection={
        <Button
          leftIcon={<Search />}
          sx={{
            height: "100%",
            ":active": {
              transform: "translateY(0px)",
              filter: "brightness(2)",
            },
          }}
          onClick={() => {
            if (!value) return;
            if (value?.type === "event") {
              router.push(`/events/${value.slug}`);
            } else if (value?.type === "venue") {
              router.push(`/venues/${value.slug}`);
            }
          }}
        >
          Search
        </Button>
      }
      type="email"
      placeholder="Search for your journey..."
      radius="xs"
      size={!matches ? "lg" : "xs"}
      dropdownPosition="bottom"
      withinPortal
      nothingFound={<Text>No results</Text>}
      onItemSubmit={(item) => {
        setValue(item as any);
      }}
      onChange={(value) => {
        setValue(null);
      }}
    />
  );
};

export default SearchField;
