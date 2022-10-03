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
import { useForm } from "@mantine/form";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { Check, X } from "tabler-icons-react";
import FileUpload from "../../../components/FileUpload/FileUpload.component";
import Map from "../../../components/GoogleMap/GoogleMap.component";
import {
  fetchVenueControllerCreate,
  fetchVenueControllerUpdate,
} from "../../../services/api/theRoundComponents";
import { Venue } from "../../../services/api/theRoundSchemas";
import { saveToBucket } from "../../../utils/aws";

interface FormValues {
  isActive: boolean;
  title: string;
  shortDescription: string;
  longDescription: string;
  bannerUrl: string;
  logoUrl: string;
  latitude?: number;
  longitude?: number;
  websiteUrl?: string;
}

type VenueWithId = Venue & { _id?: string };
export interface VenueCreateEditProps {
  venue?: VenueWithId;
  onCreate?: () => void;
  onUpdate?: () => void;
}

const VenueCreateEdit = ({
  venue,
  onCreate,
  onUpdate,
}: VenueCreateEditProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      title: venue?.title || "",
      shortDescription: venue?.shortDescription || "",
      longDescription: venue?.longDescription || "",
      bannerUrl:
        venue?.bannerUrl ||
        "https://drive.google.com/file/d/1LtQm4EZurB-qSkq94BItZVVmr1gWfxQG/view?usp=sharing",
      logoUrl:
        venue?.logoUrl ||
        "https://drive.google.com/file/d/1LtQm4EZurB-qSkq94BItZVVmr1gWfxQG/view?usp=sharing",
      isActive: venue?.isActive || false,
    },
  });

  useEffect(() => {
    if (venue) {
      form.setValues({
        title: venue.title,
        shortDescription: venue.shortDescription,
        longDescription: venue.longDescription,
        bannerUrl: venue.bannerUrl,
        logoUrl: venue.logoUrl,
        isActive: venue.isActive,
      });
    }
  }, [form, venue]);

  const createVenue = async () => {
    setIsLoading(true);

    showNotification({
      id: "create-venue",
      loading: true,
      disallowClose: true,
      title: "Venue Creation",
      message: "Please wait we are creating a venue...",
      icon: <Check />,
    });

    try {
      const data = form.values;

      data.bannerUrl =
        "https://drive.google.com/file/d/1LtQm4EZurB-qSkq94BItZVVmr1gWfxQG/view?usp=sharing";

      data.logoUrl =
        "https://drive.google.com/file/d/1LtQm4EZurB-qSkq94BItZVVmr1gWfxQG/view?usp=sharing";

      const create = await fetchVenueControllerCreate({
        body: {
          ...data,
        },
      });

      console.log(create);

      if (logoFile) {
        const imagePath = await saveToBucket(
          `events/${create.slug}/logo-${create.slug}`,
          logoFile
        );
        const updated = await fetchVenueControllerUpdate({
          pathParams: {
            id: (create as any)._id,
          },
          body: {
            logoFile: imagePath,
          },
        });

        console.log(updated);
      }

      if (bannerFile) {
        const imagePath = await saveToBucket(
          `events/${create.slug}/banner-${create.slug}`,
          bannerFile
        );
        const updated = await fetchVenueControllerUpdate({
          pathParams: {
            id: (create as any)._id,
          },
          body: {
            logoUrl: imagePath,
          },
        });

        console.log(updated);
      }

      updateNotification({
        id: "create-venue",
        loading: false,
        title: "Venue Creation",
        message: "Venue created successfully",
      });

      onCreate?.();
    } catch (error) {
      updateNotification({
        id: "create-venue",
        loading: false,
        title: "Venue Creation",
        message: "There was an error creating the venue",
        icon: <X />,
        color: "red",
      });
    }

    setIsLoading(false);
  };

  const updateVenue = async () => {
    setIsLoading(true);

    showNotification({
      id: "update-venue",
      loading: true,
      disallowClose: true,
      title: "Venue Update",
      message: "Please wait we are updating the venue...",
      icon: <Check />,
    });

    try {
      const data = form.values;
      const update = await fetchVenueControllerUpdate({
        pathParams: {
          id: venue?._id || "",
        },
        body: {
          id: venue?._id || "",
          ...data,
        },
      });

      console.log(update);

      updateNotification({
        id: "update-venue",
        loading: false,
        title: "Venue Update",
        message: "Venue updated successfully",
      });

      onUpdate?.();
    } catch (error) {
      updateNotification({
        id: "update-venue",
        loading: false,
        title: "Venue Update",
        message: "There was an error updating the venue",
        icon: <X />,
        color: "red",
      });
    }

    setIsLoading(false);
  };

  const handleSubmit = () => {
    if (venue) {
      updateVenue();
    } else {
      createVenue();
    }
  };

  return (
    <Box mx="auto">
      <Title mb={8}>{venue ? "Update" : "Create new"} Venue</Title>
      <form onSubmit={form.onSubmit((values) => handleSubmit())}>
        <fieldset style={{ border: 0 }} disabled={isLoading}>
          <Stack spacing={16}>
            <Text>Banner Image:</Text>
            <FileUpload
              dropzoneText="Choose a banner image"
              multiple={false}
              onFilesChange={(files) => {
                setBannerFile(files[0]);
              }}
            />

            <Text>Logo Image:</Text>
            <FileUpload
              dropzoneText="Choose a logo image"
              multiple={false}
              onFilesChange={(files) => {
                setLogoFile(files[0]);
              }}
            />

            <TextInput
              required
              label="Name"
              placeholder="Venue Name"
              {...form.getInputProps("title")}
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
              label="Website url"
              placeholder="Website url"
              {...form.getInputProps("websiteUrl")}
            />

            <Switch
              label="Is this venue active?"
              size="lg"
              onLabel="Yes"
              offLabel="No"
              {...form.getInputProps("isActive", { type: "checkbox" })}
            />

            <Map
              height="40vh"
              center={{ lat: 51.507351, lng: -0.127758 }}
              marker={null}
              isEditable={true}
              onMarkerChange={(location) => {
                form.setFieldValue("latitude", location.lat);
                form.setFieldValue("longitude", location.lng);
              }}
            />

            <Group position="right" mt="md">
              <Button disabled={isLoading} type="submit">
                {venue ? "Update" : "Create"}
              </Button>
            </Group>
          </Stack>
        </fieldset>
      </form>
    </Box>
  );
};

export default VenueCreateEdit;
