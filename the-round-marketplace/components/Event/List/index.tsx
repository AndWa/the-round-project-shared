/* eslint-disable react-hooks/exhaustive-deps */
import {
  Alert,
  Button,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { NextLink } from "@mantine/next";
import { NextPage } from "next";
import { useEffect } from "react";
import { AlertCircle, Check, X } from "tabler-icons-react";
import {
  fetchEventControllerUpdate,
  useUserControllerEventsOwnedByVenueSlug,
  useUserControllerVenuesOwned,
} from "../../../services/api/theRoundComponents";
import { Event } from "../../../services/api/theRoundSchemas";

const EventsList: NextPage = () => {
  const {
    data: venues,
    isLoading: isLoadingVenues,
    error: errorVenues,
    refetch: refetchVenues,
  } = useUserControllerVenuesOwned({});

  const { data, isLoading, error, refetch } =
    useUserControllerEventsOwnedByVenueSlug(
      {
        pathParams: {
          slug: venues?.[0]?.slug ?? "",
        },
      },
      {
        enabled: false,
      }
    );

  useEffect(() => {
    if (venues && venues.length > 0) {
      refetch();
    }
  }, [venues]);

  const openDeactivateModal = (event: Event) =>
    openConfirmModal({
      title: `${event.isActive ? "Deactivate" : "Activate"} user`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to {event.isActive ? "deactivate" : "activate"}{" "}
          <b>{event.title}</b>?
        </Text>
      ),
      labels: {
        confirm: event.isActive ? "Deactivate" : "Activate",
        cancel: "No",
      },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => onDeactivate((event as any)._id, !event.isActive),
    });

  const onDeactivate = async (id: string, shouldActivate: boolean) => {
    try {
      const user = await fetchEventControllerUpdate({
        pathParams: {
          id,
        },
        body: {
          isActive: shouldActivate,
        },
      });

      console.log(user);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const rows = data?.map((element) => (
    <tr key={element.slug}>
      <td width={80}>
        <Image
          radius={4}
          src={element.bannerUrl}
          height={80}
          width={80}
          withPlaceholder
          alt={element.title}
        />
      </td>
      <td>{element.title}</td>
      <td>{element.isActive ? <Check /> : <X />}</td>
      <td>{element.isMature ? <Check /> : <X />}</td>
      <td>{element.shortDescription}</td>
      <td>{new Date(element.startDate).toLocaleString()}</td>
      <td>{new Date(element.endDate).toLocaleString()}</td>
      <td>
        <Group>
          <Button
            component={NextLink}
            href={`/admin/events/edit/${element.slug}`}
          >
            Edit
          </Button>
          <Button color="red" onClick={() => openDeactivateModal(element)}>
            {element.isActive ? "Deactivate" : "Activate"}
          </Button>
        </Group>
      </td>
    </tr>
  ));

  if (isLoadingVenues) {
    return <Loader size="lg" />;
  }

  return (
    <Stack align="flex-start">
      <Button
        component={NextLink}
        href="/admin/events/create"
        variant="outline"
      >
        Create New
      </Button>
      <Paper sx={{ width: "100%" }} shadow="sm" p="md" withBorder>
        <Alert
          mb={16}
          icon={<AlertCircle size={32} />}
          title="Event deactivation"
        >
          You cannot delete events since they are connected to the listings, but
          you can deactivate them.
        </Alert>
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Image</th>
              <th>Event Name</th>
              <th>Active</th>
              <th>Mature</th>
              <th>Short Description</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default EventsList;
