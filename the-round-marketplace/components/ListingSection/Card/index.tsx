import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Image,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useOs } from "@mantine/hooks";
import { closeAllModals, openConfirmModal, openModal } from "@mantine/modals";
import { useQRCode } from "next-qrcode";
import { useEffect, useState } from "react";
import { AugmentedReality, QuestionMark } from "tabler-icons-react";
import { useNearPriceContext } from "../../../context/NearPriceContext";
import { useUserContext } from "../../../context/UserContext";
import { useWalletSelector } from "../../../context/WalletSelectorContext";
import { Listing } from "../../../services/api/theRoundSchemas";
import ModelViewer from "../../ModelViewer";

export interface ListingCardProps {
  listing: Listing;
  owned?: boolean;
}

const ListingCard = ({ listing, owned }: ListingCardProps) => {
  const userData = useUserContext();
  const { buyNft } = useWalletSelector();
  const { nearPrice } = useNearPriceContext();
  const [fiatPrice, setFiatPrice] = useState<string | null>(null);
  const { Canvas } = useQRCode();
  const os = useOs();

  useEffect(() => {
    if (!nearPrice) return;
    setFiatPrice((listing.price * nearPrice).toString());
  }, [nearPrice, listing.price]);

  const buy = async () => {
    if (userData.user?.accountType === "near") {
      await buyNft(listing.tokenSeriesId, listing.price);
    } else {
      console.log("buy with credit card");
    }
  };

  const openModelViewer = () => {
    if (["ios", "android"].includes(os)) {
      openModal({
        title: listing.title,
        children: (
          <ModelViewer
            src={listing.merchandise.model}
            alt={listing.title}
            poster={listing.media}
          />
        ),
      });
    } else {
      openConfirmModal({
        title: listing.title,
        closeOnConfirm: false,
        labels: {
          confirm: "AR experience",
          cancel: "Close",
        },
        children: (
          <ModelViewer
            src={listing.merchandise.model}
            alt={listing.title}
            poster={listing.media}
          />
        ),
        onConfirm: () =>
          openConfirmModal({
            title: "Scan QR code with your phone",
            labels: { confirm: "Close", cancel: "Back" },
            closeOnConfirm: false,
            children: (
              <Center>
                <Canvas
                  text={`${window.location.origin}/model-preview/${
                    (listing as any)._id
                  }`}
                  options={{
                    type: "image/jpeg",
                    quality: 0.3,
                    level: "M",
                    margin: 3,
                    scale: 4,
                    width: 200,
                    color: {
                      dark: "#000000",
                      light: "#ffffff",
                    },
                  }}
                />
              </Center>
            ),
            onConfirm: closeAllModals,
          }),
      });
    }
  };

  return (
    <Card withBorder radius="xs">
      <Card.Section sx={{ position: "relative" }}>
        <Image
          height={200}
          src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listing/${listing.tokenSeriesId}/media`}
          alt={listing.title}
          withPlaceholder
        />
        {listing.merchandise?.model && (
          <ActionIcon
            radius="xs"
            variant="filled"
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={openModelViewer}
          >
            <AugmentedReality size={18} />
          </ActionIcon>
        )}
      </Card.Section>

      <Group position="apart" mt="sm">
        <Text weight={500}>{listing.title}</Text>
        {!owned &&
          !(
            listing.endDate !== null && new Date(listing.endDate) < new Date()
          ) &&
          listing.stock > 0 && (
            <Badge variant="outline">
              {listing.available > 0
                ? `In Stock: ${listing.available} out of ${listing.stock}`
                : "Out of Stock"}
            </Badge>
          )}
        {!owned &&
          listing.endDate !== null &&
          new Date(listing.endDate) < new Date() && (
            <Badge variant="outline">Sale Ended</Badge>
          )}
      </Group>

      <Card.Section p="md" pt="xs" pb="sm">
        <Text size="md">{listing.description}</Text>
      </Card.Section>

      {!owned && listing.endDate !== null && (
        <Card.Section px="md" pb="xs">
          <Text size="sm" color="dimmed">
            Sale end on {new Date(listing.endDate).toLocaleString()}
          </Text>
        </Card.Section>
      )}

      {!owned && (
        <>
          <Divider />

          <Card.Section p="md">
            <Group spacing={30}>
              {listing.price > 0 ? (
                <div>
                  <Group>
                    <div>
                      <Text size="xl" weight={700} sx={{ lineHeight: 1 }}>
                        {listing.price}
                      </Text>
                      <Text
                        size="sm"
                        color="dimmed"
                        weight={500}
                        sx={{ lineHeight: 1 }}
                        mt={3}
                      >
                        NEAR
                      </Text>
                    </div>
                    <Tooltip label={`${fiatPrice} USD`} position="right">
                      <ThemeIcon variant="outline" size="xs" radius="xl">
                        <QuestionMark />
                      </ThemeIcon>
                    </Tooltip>
                  </Group>

                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1 }} mt={3}>
                    + storage fee
                  </Text>
                </div>
              ) : (
                <div>
                  <Text size="lg" weight={700} sx={{ lineHeight: 1 }}>
                    FREE
                  </Text>
                  <Text size="xs" color="dimmed" sx={{ lineHeight: 1 }} mt={3}>
                    + storage fee
                  </Text>
                </div>
              )}

              <Button
                radius="xl"
                style={{ flex: 1 }}
                onClick={buy}
                disabled={
                  (listing.stock > 0 && listing.available <= 0) ||
                  !userData.user ||
                  userData.ownedNfts.find(
                    (nft) => nft.tokenSeriesId === listing.tokenSeriesId
                  ) !== undefined ||
                  (listing.endDate !== null &&
                    new Date(listing.endDate) < new Date())
                }
              >
                {userData.ownedNfts.find(
                  (nft) => nft.tokenSeriesId === listing.tokenSeriesId
                ) !== undefined
                  ? "Owned"
                  : "Buy Now"}
              </Button>
            </Group>
          </Card.Section>
        </>
      )}
    </Card>
  );
};

export default ListingCard;
