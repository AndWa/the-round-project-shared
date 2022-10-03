import { Box } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import VenueCreateEdit from "../../../../components/Venue/CreateEdit";
import { useUserControllerVenuesFindOne } from "../../../../services/api/theRoundComponents";

const EditVenue: NextPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const { data } = useUserControllerVenuesFindOne(
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
    router.push("/admin/venues");
  };

  return (
    <Box>
      <VenueCreateEdit venue={data} onUpdate={onUpdate} />
    </Box>
  );
};

export default EditVenue;
