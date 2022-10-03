import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { NextLink } from "@mantine/next";
import { Bookmark, BookmarkOff } from "tabler-icons-react";
import { useUserContext } from "../../../context/UserContext";
import { fetchUserControllerToggleVenueBookmark } from "../../../services/api/theRoundComponents";
import { Venue } from "../../../services/api/theRoundSchemas";

interface VenueCardProps {
  image: string;
  title: string;
  category: string;
  venue: Venue;
}

const VenueCard = ({ image, title, category, venue }: VenueCardProps) => {
  const theme = useMantineTheme();
  const userData = useUserContext();

  const toggleBookmark = async () => {
    const result = await fetchUserControllerToggleVenueBookmark({
      pathParams: {
        venueId: (venue as any)._id,
      },
    });

    if (result) {
      userData.getUser();
    }
  };

  return (
    <Paper
      shadow="md"
      p="xl"
      sx={{
        backgroundImage: `url(${image})`,
        height: 440,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div>
        <Text
          sx={{
            color: "#000000",
            opacity: 0.7,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
          lineClamp={1}
          size="md"
        >
          {category}
        </Text>
        <Title
          order={3}
          sx={{
            fontWeight: 900,
            color: "#000000",
            lineHeight: 1.2,
            fontSize: 32,
            marginTop: theme.spacing.xs,
          }}
        >
          {title}
        </Title>
      </div>
      <Group sx={{ width: "100%" }} position="apart">
        <Button
          component={NextLink}
          href={`/venues/${venue.slug}`}
          radius="xl"
          size="md"
        >
          More information
        </Button>
        {userData.user && (
          <ActionIcon variant="filled" onClick={toggleBookmark} size="lg">
            {userData.user?.bookmarkedVenues.find(
              (el) => (el as any)._id === (venue as any)._id
            ) ? (
              <BookmarkOff size={18} />
            ) : (
              <Bookmark size={18} />
            )}
          </ActionIcon>
        )}
      </Group>
    </Paper>
  );
};

export default VenueCard;
