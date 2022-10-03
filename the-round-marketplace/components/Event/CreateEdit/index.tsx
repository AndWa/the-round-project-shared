import {
  Box,
  Button,
  Group,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Check, X } from "tabler-icons-react";
import FileUpload from "../../../components/FileUpload/FileUpload.component";
import {
  fetchEventControllerCreate,
  fetchEventControllerUpdate,
} from "../../../services/api/theRoundComponents";
import { Event } from "../../../services/api/theRoundSchemas";
import { saveToBucket } from "../../../utils/aws";

interface FormValues {
  isActive: boolean;
  isMature: boolean;
  startDate: string;
  endDate: string;
  title: string;
  type: string;
  shortDescription: string;
  longDescription: string;
  mediaUrls?: string[];
  bannerUrl: string;
  mediaUrl: string;
  trailerUrl?: string;
}

type EventWithId = Event & { _id?: string };
export interface EventCreateEditProps {
  event?: EventWithId;
  onCreate?: () => void;
  onUpdate?: () => void;
}

const EventCreateEdit = ({
  event,
  onCreate,
  onUpdate,
}: EventCreateEditProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const form = useForm<FormValues>({
    initialValues: {
      title: event?.title || "",
      type: event?.type || "",
      shortDescription: event?.shortDescription || "",
      longDescription: event?.longDescription || "",
      bannerUrl:
        event?.bannerUrl ||
        "https://s3.eu-west-2.amazonaws.com/roundwebassets/events/the-round-venue-jav91s/banner-the-round-venue-jav91s",
      mediaUrl:
        event?.mediaUrl ||
        "https://s3.eu-west-2.amazonaws.com/roundwebassets/events/the-round-venue-jav91s/banner-the-round-venue-jav91s",
      isActive: event?.isActive || false,
      isMature: event?.isMature || false,
      startDate: event?.startDate || new Date().toISOString(),
      endDate: event?.endDate || new Date().toISOString(),
    },
  });

  useEffect(() => {
    if (event) {
      form.setValues({
        title: event.title,
        type: event.type,
        shortDescription: event.shortDescription,
        longDescription: event.longDescription,
        bannerUrl: event.bannerUrl,
        mediaUrl: event.mediaUrl,
        isActive: event.isActive,
        isMature: event.isMature,
        startDate: event.startDate,
        endDate: event.endDate,
      });
    }
  }, [event, form]);

  const createEvent = async () => {
    setIsLoading(true);

    showNotification({
      id: "create-event",
      loading: true,
      disallowClose: true,
      title: "Event Creation",
      message: "Please wait we are creating an event...",
      icon: <Check />,
    });

    try {
      const data = form.values;

      const venueId = (JSON.parse(localStorage.getItem("venues")!) as any)[0]
        ._id;

      if (!venueId) throw new Error("Venue not found");

      data.bannerUrl =
        "https://s3.eu-west-2.amazonaws.com/roundwebassets/events/the-round-venue-jav91s/banner-the-round-venue-jav91s";
      data.mediaUrl =
        "https://s3.eu-west-2.amazonaws.com/roundwebassets/events/the-round-venue-jav91s/banner-the-round-venue-jav91s";

      const create = await fetchEventControllerCreate({
        body: {
          ...data,
          bannerUrl: "https://via.placeholder.com/150",
          venue: venueId,
        },
      });

      console.log(create);

      if (bannerFile) {
        const imagePath = await saveToBucket(
          `events/${create.slug}/banner-${create.slug}`,
          bannerFile
        );
        const updated = await fetchEventControllerUpdate({
          pathParams: {
            id: (create as any)._id,
          },
          body: {
            bannerUrl: imagePath,
          },
        });

        console.log(updated);
      }

      if (mediaFile) {
        const imagePath = await saveToBucket(
          `events/${create.slug}/media-${create.slug}`,
          mediaFile
        );
        const updated = await fetchEventControllerUpdate({
          pathParams: {
            id: (create as any)._id,
          },
          body: {
            mediaUrl: imagePath,
          },
        });

        console.log(updated);
      }

      if (mediaFiles.length > 0) {
        const mediaUrls = await Promise.all(
          mediaFiles.map(async (file, index) => {
            const imagePath = await saveToBucket(
              `events/${create.slug}/media-${index + 1}-${create.slug}`,
              file
            );
            return imagePath;
          })
        );

        const updated = await fetchEventControllerUpdate({
          pathParams: {
            id: (create as any)._id,
          },
          body: {
            mediaUrls,
          },
        });

        console.log(updated);
      }

      updateNotification({
        id: "create-event",
        loading: false,
        title: "Event Creation",
        message: "Event created successfully",
      });

      onCreate?.();
    } catch (error) {
      console.log(error);
      updateNotification({
        id: "create-event",
        loading: false,
        title: "Event Creation",
        message: "There was an error creating the event",
        icon: <X />,
        color: "red",
      });
    }

    setIsLoading(false);
  };

  const updateEvent = async () => {
    setIsLoading(true);

    showNotification({
      id: "update-event",
      loading: true,
      disallowClose: true,
      title: "Event Update",
      message: "Please wait we are updating the event...",
      icon: <Check />,
    });

    try {
      const data = form.values;
      const update = await fetchEventControllerUpdate({
        pathParams: {
          id: event?._id || "",
        },
        body: {
          ...data,
        },
      });

      console.log(update);

      updateNotification({
        id: "update-event",
        loading: false,
        title: "Event Update",
        message: "Event updated successfully",
      });

      onUpdate?.();
    } catch (error) {
      updateNotification({
        id: "update-event",
        loading: false,
        title: "Event Update",
        message: "There was an error updating the event",
        icon: <X />,
        color: "red",
      });
    }

    setIsLoading(false);
  };

  const handleSubmit = () => {
    if (event) {
      updateEvent();
    } else {
      createEvent();
    }
  };

  return (
    <Box mx="auto">
      <Title mb={8}>{event ? "Update" : "Create new"} Event</Title>
      <Text>Banner Image:</Text>
      <FileUpload
        dropzoneText="Choose a banner image"
        multiple={false}
        onFilesChange={(files) => {
          setBannerFile(files[0]);
        }}
      />

      <Text>Media Image:</Text>
      <FileUpload
        dropzoneText="Choose a media image"
        multiple={false}
        onFilesChange={(files) => {
          setMediaFile(files[0]);
        }}
      />

      <Text>Media Images:</Text>
      <FileUpload
        key={mediaFiles.toString()}
        dropzoneText="Choose media images"
        multiple={true}
        onFilesChange={(files) => {
          setMediaFiles(files);
        }}
      />
      <form onSubmit={form.onSubmit((values) => handleSubmit())}>
        <fieldset style={{ border: 0 }} disabled={isLoading}>
          <Stack spacing={16}>
            <TextInput
              required
              label="Name"
              placeholder="Name"
              {...form.getInputProps("title")}
            />

            <DatePicker
              defaultValue={
                form?.values.startDate
                  ? new Date(form?.values.startDate)
                  : new Date()
              }
              placeholder="Pick start date"
              label="Event start date"
              required
              onChange={(date) => {
                form.setFieldValue("startDate", date?.toISOString() ?? "");
              }}
            />

            <TimeInput
              value={event?.startDate ? new Date(event?.startDate) : new Date()}
              label="Event start time"
              required
              onChange={(date) => {
                form.setFieldValue("startDate", date?.toISOString() ?? "");
              }}
            />

            <DatePicker
              defaultValue={
                event?.endDate ? new Date(event?.endDate) : new Date()
              }
              placeholder="Pick end date"
              label="Event end date"
              required
              onChange={(date) => {
                form.setFieldValue("endDate", date?.toISOString() ?? "");
              }}
            />

            <TimeInput
              value={
                form?.values.endDate
                  ? new Date(form?.values.endDate)
                  : new Date()
              }
              label="Event end time"
              required
              onChange={(date) => {
                form.setFieldValue("endDate", date?.toISOString() ?? "");
              }}
            />

            <TextInput
              required
              label="Short Description"
              placeholder="Short Description"
              {...form.getInputProps("shortDescription")}
            />
            <Textarea
              placeholder="Description"
              label="Long Description"
              required
              autosize
              minRows={2}
              maxRows={4}
              {...form.getInputProps("longDescription")}
            />
            <TextInput
              label="Event type"
              placeholder="Event type"
              {...form.getInputProps("type")}
            />
            <TextInput
              label="Trailer url (YouTube, Facebook, Twitch, SoundCloud, Streamable, Vimeo, Wistia, DailyMotion)"
              placeholder="Trailer url"
              {...form.getInputProps("trailerUrl")}
            />
            <Switch
              label="Is this event active?"
              size="lg"
              onLabel="Yes"
              offLabel="No"
              {...form.getInputProps("isActive", { type: "checkbox" })}
            />
            <Switch
              label="Is this event mature?"
              size="lg"
              onLabel="Yes"
              offLabel="No"
              {...form.getInputProps("isMature", { type: "checkbox" })}
            />
            <Group position="right" mt="md">
              <Button disabled={isLoading} type="submit">
                {event ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </fieldset>
      </form>
    </Box>
  );
};

export default EventCreateEdit;
