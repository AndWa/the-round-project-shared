import {
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
import { Check, X } from "tabler-icons-react";
import {
  fetchVenueControllerRemove,
  useUserControllerVenuesOwned,
} from "../../../services/api/theRoundComponents";
import { Venue } from "../../../services/api/theRoundSchemas";

const VenueList = () => {
  const { data, isLoading, error, refetch } = useUserControllerVenuesOwned({});

  const openDeleteModal = (venue: Venue) =>
    openConfirmModal({
      title: "Delete venue",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete {venue.title}? This action is
          destructive and you will not be able to recover it.
        </Text>
      ),
      labels: { confirm: "Delete venue", cancel: "No don't delete it" },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => onDelete((venue as any)._id),
    });

  const onDelete = async (id: string) => {
    try {
      const deleted = await fetchVenueControllerRemove({
        pathParams: {
          id,
        },
      });

      console.log(deleted);
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
          src={element.logoUrl}
          height={80}
          width={80}
          withPlaceholder
          alt={element.title}
        />
      </td>
      <td>{element.title}</td>
      <td>{element.isActive ? <Check /> : <X />}</td>
      <td>{element.shortDescription}</td>
      <td>
        <Group>
          <Button
            component={NextLink}
            href={`/admin/venues/edit/${element.slug}`}
          >
            Edit
          </Button>
          <Button color="red" onClick={() => openDeleteModal(element)}>
            Delete
          </Button>
        </Group>
      </td>
    </tr>
  ));

  if (isLoading) {
    return <Loader size="lg" />;
  }

  return (
    <Stack align="flex-start">
      <Button
        component={NextLink}
        href="/admin/venues/create"
        variant="outline"
      >
        Create New
      </Button>
      <Paper sx={{ width: "100%" }} shadow="sm" p="md" withBorder>
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Image</th>
              <th>Venue Name</th>
              <th>Active</th>
              <th>Short Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default VenueList;
