import {
  Alert,
  Button,
  Image,
  Loader,
  NativeSelect,
  Paper,
  Stack,
  Table,
} from "@mantine/core";
import { NextLink } from "@mantine/next";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { AlertCircle, Check, X } from "tabler-icons-react";
import { useUserContext } from "../../../context/UserContext";
import {
  useEventControllerFindAllTickets,
  useUserControllerEventsOwnedByVenueSlug,
} from "../../../services/api/theRoundComponents";
import { Event } from "../../../services/api/theRoundSchemas";

const Tickets: NextPage = () => {
  const userData = useUserContext();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: eventsData, isLoading: eventsLoading } =
    useUserControllerEventsOwnedByVenueSlug(
      {
        pathParams: {
          slug: JSON.parse(localStorage.getItem("venues") || "[]")[0].slug,
        },
      },
      {
        enabled: Boolean(userData.venues[0]),
      }
    );

  const { data, isLoading, error, refetch } = useEventControllerFindAllTickets(
    {
      pathParams: {
        slug: selectedEvent?.slug ?? "",
      },
    },
    {
      enabled: Boolean(selectedEvent),
    }
  );

  useEffect(() => {
    setSelectedEvent(eventsData?.[0] ?? null);
  }, [eventsData]);

  const rows = data?.map((element) => (
    <tr key={element.slug}>
      <td width={80}>
        <Image
          radius={4}
          src={element.media}
          height={80}
          width={80}
          withPlaceholder
          alt={element.title}
        />
      </td>
      <td>{element.title}</td>
      <td>{element.isActive ? <Check /> : <X />}</td>
      <td>{element.stock}</td>
      <td>{element.price} NEAR</td>
      <td>{new Date(element.startDate).toLocaleString()}</td>
      <td>{new Date(element.endDate).toLocaleString()}</td>
      <td></td>
    </tr>
  ));

  if (eventsLoading || isLoading) {
    return <Loader size="lg" />;
  }

  return (
    <Stack align="flex-start">
      <NativeSelect
        size="md"
        data={eventsData?.map((event) => event.title) ?? []}
        placeholder="Choose an event"
        label="Select an event"
        description="You will manage tickets for the selected event"
        radius="xs"
        required
        value={selectedEvent?.title ?? ""}
        onChange={(event) => {
          setSelectedEvent(
            eventsData?.filter(
              (e) => e.title.toLowerCase() === event.target.value.toLowerCase()
            )[0] ?? null
          );
        }}
      />
      {selectedEvent && (
        <Button
          component={NextLink}
          href={`/admin/tickets/create/${(selectedEvent as any)._id}`}
        >
          Create new ticket
        </Button>
      )}
      {selectedEvent && (
        <Paper sx={{ width: "100%" }} shadow="sm" p="md" withBorder>
          <Alert mb={16} icon={<AlertCircle size={32} />} title="Tickets">
            Once you create a ticket you will not be able to delete it. You will
            also be required to sign a transaction with your <b>NEAR</b> wallet
            and pay a small fee.
          </Alert>

          <Table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Active</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
};

export default Tickets;
