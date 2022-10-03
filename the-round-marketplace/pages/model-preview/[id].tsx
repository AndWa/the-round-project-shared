import { Box, Button, Center, Stack, Text, Title } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ModelViewer from "../../components/ModelViewer";
import { fetchListingControllerFindOne } from "../../services/api/theRoundComponents";
import { Listing } from "../../services/api/theRoundSchemas";

const ModelPreview = () => {
  const router = useRouter();
  const { id } = router.query;
  const [model, setModel] = useState<Listing | null>(null);

  useEffect(() => {
    const getListing = async () => {
      console.log("id", id);
      const listing = await fetchListingControllerFindOne({
        pathParams: {
          id: id as string,
        },
      });

      if (!listing.merchandise) {
        router.push("/");
        return;
      }

      setModel(listing);

      openModelViewer(listing.merchandise.model, listing.title, listing.media);
    };

    if (id) {
      getListing();
    }
  }, [id, router]);

  const openModelViewer = (src: string, alt: string, poster: string) => {
    openModal({
      title: "Model Preview",
      children: (
        <Box sx={{ width: "100%" }}>
          <ModelViewer src={src} alt={alt} poster={poster} />
        </Box>
      ),
      fullScreen: true,
    });
  };

  return (
    <Center>
      <Stack mt="xl" align="center">
        <Title>Model Preview</Title>
        <Text>This is the model preview page.</Text>
        <Button
          onClick={() => {
            if (!model) return;
            openModelViewer(model.merchandise.model, model.title, model.media);
          }}
        >
          Open Preview
        </Button>
      </Stack>
    </Center>
  );
};

export default ModelPreview;
