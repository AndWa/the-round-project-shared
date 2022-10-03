import { Box, Tabs, Text, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { Bookmark, Package, Ticket } from "tabler-icons-react";
import EventsSection, { EventType } from "../../components/EventSection";
import ListingSection, { ListingType } from "../../components/ListingSection";
import VenuesSection, { VenueType } from "../../components/VenuesSection";

const Account = () => {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.md}px)`);
  const xPadding = mobile ? 16 : 60;
  const [currentValue, setCurrentValue] = useState("tickets");

  return (
    <Tabs
      defaultValue="tickets"
      px={xPadding}
      pt="xl"
      onTabChange={(value) => setCurrentValue(value?.toString() ?? "tickets")}
    >
      <Tabs.List grow={mobile}>
        <Tabs.Tab value="tickets" icon={<Ticket size={18} />}>
          <Text size="lg" weight={500}>
            Tickets
          </Text>
        </Tabs.Tab>
        <Tabs.Tab value="merchandise" icon={<Package size={18} />}>
          <Text size="lg" weight={500}>
            Merchandise
          </Text>
        </Tabs.Tab>
        <Tabs.Tab value="bookmarks" icon={<Bookmark size={18} />}>
          <Text size="lg" weight={500}>
            Bookmarks
          </Text>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="tickets" py="md">
        {currentValue === "tickets" && (
          <ListingSection slug="" type={ListingType.OwnedTickets} />
        )}
      </Tabs.Panel>

      <Tabs.Panel value="merchandise" py="md">
        {currentValue === "merchandise" && (
          <ListingSection slug="" type={ListingType.OwnedMerchandise} />
        )}
      </Tabs.Panel>

      <Tabs.Panel value="bookmarks" py="md">
        {currentValue === "bookmarks" && (
          <>
            <VenuesSection type={VenueType.Bookmarked} />
            <Box my="xl"></Box>
            <EventsSection type={EventType.Bookmarked} />
          </>
        )}
      </Tabs.Panel>
    </Tabs>
  );
};

export default Account;
