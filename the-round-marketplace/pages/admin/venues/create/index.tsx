import { NextPage } from "next";
import { useRouter } from "next/router";
import VenueCreateEdit from "../../../../components/Venue/CreateEdit";

const VenueCreate: NextPage = () => {
  const router = useRouter();

  const onCreate = () => {
    router.push("/admin/venues");
  };

  return <VenueCreateEdit onCreate={onCreate} />;
};

export default VenueCreate;
