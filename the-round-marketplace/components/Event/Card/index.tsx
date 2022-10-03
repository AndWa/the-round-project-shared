import {
  ActionIcon,
  Badge,
  Card,
  Center,
  Group,
  Image,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { NextLink } from "@mantine/next";
import { Bookmark, BookmarkOff, Share } from "tabler-icons-react";
import { useUserContext } from "../../../context/UserContext";
import { fetchUserControllerToogleEventBookmark } from "../../../services/api/theRoundComponents";
import { Event, Venue } from "../../../services/api/theRoundSchemas";
import showShareSocialModal from "../../ShareSocialModal";

interface EventCardProps {
  event: Event;
  image: string;
  title: string | null;
  description: string;
  type: string;
  venue: Venue;
}

export function EventCard({
  event,
  image,
  title,
  description,
  type,
  venue,
  ...others
}: EventCardProps) {
  const theme = useMantineTheme();
  const userData = useUserContext();

  const showShareModal = () => {
    showShareSocialModal({
      title: event.title,
      description: event.shortDescription,
      image: event.bannerUrl,
      url: `${window.location.origin}/events/${event.slug}`,
      hashtag: "#theRound",
    });
  };

  const toggleBookmark = async () => {
    const result = await fetchUserControllerToogleEventBookmark({
      pathParams: {
        eventId: (event as any)._id,
      },
    });

    if (result) {
      userData.getUser();
    }
  };

  return (
    <Card withBorder sx={{ position: "relative" }}>
      <Card.Section>
        <NextLink href={`/events/${event.slug}`}>
          <Image src={image} height={220} withPlaceholder alt={event.title} />
        </NextLink>
      </Card.Section>

      <Badge
        sx={{
          position: "absolute",
          top: theme.spacing.xs,
          right: theme.spacing.xs + 2,
          pointerEvents: "none",
        }}
        variant="gradient"
        gradient={{ from: "yellow", to: "red" }}
        size="lg"
      >
        {type}
      </Badge>

      <Stack spacing={0}>
        <Text mt="sm" size="lg" weight={500}>
          {title}
        </Text>

        <Text size="md" color="dimmed" lineClamp={1}>
          {description}
        </Text>

        <Text mt="md" color="dimmed" size="sm">
          {new Date(event.startDate).toLocaleString()}
        </Text>

        <Group mt="md" position="apart">
          {venue && (
            <Center>
              <Text size="sm">
                {venue && (
                  <Badge
                    sx={{ cursor: "pointer" }}
                    component={NextLink}
                    href={`/venues/${venue.slug}`}
                    size="lg"
                    color="gray"
                  >
                    {venue.title}
                  </Badge>
                )}
              </Text>
            </Center>
          )}

          <Group spacing={8}>
            {userData.user && (
              <ActionIcon variant="light" onClick={toggleBookmark} size="lg">
                {userData.user?.bookmarkedEvents.find(
                  (el) => (el as any)._id === (event as any)._id
                ) ? (
                  <BookmarkOff size={18} />
                ) : (
                  <Bookmark size={18} />
                )}
              </ActionIcon>
            )}

            <ActionIcon variant="light" onClick={showShareModal} size="lg">
              <Share size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

export default EventCard;
