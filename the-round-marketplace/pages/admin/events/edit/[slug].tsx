import { Box } from "@mantine/core";
import { useRouter } from "next/router";
import EventCreateEdit from "../../../../components/Event/CreateEdit";
import { useEventControllerFindOne } from "../../../../services/api/theRoundComponents";

const EventEdit = () => {
  const router = useRouter();
  const { slug } = router.query;

  const { data } = useEventControllerFindOne(
    {
      pathParams: {
        slug: slug as string,
      },
    },
    {
      enabled: slug !== undefined,
    }
  );

  const onUpdate = () => {
    router.push("/admin/events");
  };

  return (
    <Box>
      <EventCreateEdit event={data} onUpdate={onUpdate} />
    </Box>
  );
};

export default EventEdit;
