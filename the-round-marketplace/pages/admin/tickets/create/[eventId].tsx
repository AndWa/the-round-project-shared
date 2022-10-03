/* eslint-disable react-hooks/exhaustive-deps */
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Group,
  NumberInput,
  Paper,
  Slider,
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
import * as nearApi from "near-api-js";
import { providers } from "near-api-js";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AlertCircle, Check, Trash, X } from "tabler-icons-react";
import FileUpload from "../../../../components/FileUpload/FileUpload.component";
import { useWalletSelector } from "../../../../context/WalletSelectorContext";
import {
  fetchListingControllerCreate,
  fetchListingControllerUpdate,
} from "../../../../services/api/theRoundComponents";
import { saveToBucket } from "../../../../utils/aws";
import combineTimeAndDate from "../../../../utils/combineDateAndTime";
export interface BaseListingFormValues {
  isActive: boolean;
  title: string;
  media: string;
  description: string;
  price?: number;
  stock?: number;
  startDate: string;
  endDate?: string;
  royalties: { walletAddress: string; royaltyPercentage: number }[];
}

interface FormValues {
  ticket: {
    afterEventMedia?: string;
    utilityInstructions?: string;
    reedemableCodes?: string[];
  };
}

type TicketListing = BaseListingFormValues & FormValues;

export interface TicketCreateProps {
  onCreate?: () => void;
}

const CreateTicket = ({ onCreate }: TicketCreateProps) => {
  const { createSeries, accountId } = useWalletSelector();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { eventId, transactionHashes } = router.query;
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [afterEventMediaFile, setAfterEventMediaFile] = useState<File | null>(
    null
  );

  const provider = new providers.JsonRpcProvider(
    "https://archival-rpc.testnet.near.org"
  );

  useEffect(() => {
    console.log("transactionHashes", transactionHashes);

    const getTransactionStatus = async (hash: string, accountId: string) => {
      const tx = await provider.txStatus(hash, accountId);

      const log = JSON.parse(
        tx.receipts_outcome[0].outcome.logs[0].split("EVENT_JSON:")[1]
      );

      const tokenSeriesId = log.data.token_series_id;
      await createTicket(tokenSeriesId);
    };

    const accountId = (JSON.parse(localStorage.getItem("user")!) as any)
      .nearWalletAccountId;

    console.log("accountId", accountId);

    if (transactionHashes && accountId) {
      getTransactionStatus(transactionHashes as string, accountId);
    }
  }, [transactionHashes]);

  const form = useForm<TicketListing>({
    initialValues: {
      isActive: true,
      title: "",
      media: "",
      description: "",
      startDate: new Date().toISOString(),
      ticket: {},
      royalties: [],
    },
    validateInputOnChange: ["royalties"],
    validate: {
      royalties: (value) =>
        value.reduce((acc, curr) => acc + curr.royaltyPercentage, 0) > 0.9
          ? "The total percentage of royalties must be less or equal to 90%"
          : null,
    },
  });

  const createTicket = async (tokenSeriesId: string | null) => {
    setIsLoading(true);

    showNotification({
      id: "create-ticket",
      loading: true,
      disallowClose: true,
      title: "Ticket Creation",
      message: "Please wait we are creating a ticket...",
      icon: <Check />,
    });

    try {
      let data = form.values;

      if (!accountId) throw new Error("No account id found");

      if (!tokenSeriesId) {
        const royalty = {} as any;
        data.royalties.forEach((r) => {
          royalty[r.walletAddress] = r.royaltyPercentage * 10000;
        });

        const create = await fetchListingControllerCreate({
          body: {
            tokenSeriesId: "-1",
            isCensored: false,
            event: eventId as string,
            ...data,
            media:
              "https://www.ledgerinsights.com/wp-content/uploads/2022/08/nft-ticket-810x524.jpg",
          },
        });

        console.log(create);

        const updateBody: {
          media?: string;
          ticket?: { afterEventMedia: string };
        } = {};

        if (mediaFile) {
          const imagePath = await saveToBucket(
            `tickets/${create.slug}/media-${create.slug}`,
            mediaFile
          );

          updateBody.media = imagePath;
        }

        if (afterEventMediaFile) {
          const imagePath = await saveToBucket(
            `tickets/${create.slug}/after-event-media-${create.slug}`,
            afterEventMediaFile
          );

          updateBody.ticket = {
            afterEventMedia: imagePath,
          };
        }

        const updated = await fetchListingControllerUpdate({
          pathParams: {
            id: (create as any)._id,
          },
          body: updateBody,
        });

        console.log(updated);

        localStorage.setItem("listing", JSON.stringify(updated));

        const transactionResult = await createSeries(
          accountId,
          data.title,
          data.description,
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/listing`,
          "",
          royalty,
          new Date(data.startDate),
          data.endDate ? new Date(data.endDate) : null,
          data.stock || 0,
          data.price || 0,
          null
        );

        const result: any = nearApi.providers.getTransactionLastResult(
          transactionResult!
        );

        console.log(result);
      }

      if (tokenSeriesId) {
        const jsonString = localStorage.getItem("listing");
        if (!jsonString) throw new Error("No listing found");

        data = JSON.parse(jsonString);

        const updated = await fetchListingControllerUpdate({
          pathParams: {
            id: (data as any)._id,
          },
          body: {
            tokenSeriesId,
          },
        });

        console.log(updated);
      }

      updateNotification({
        id: "create-ticket",
        loading: false,
        title: "Ticket Creation",
        message: "Ticket created successfully",
      });
    } catch (error) {
      console.log(error);
      updateNotification({
        id: "create-ticket",
        loading: false,
        title: "Ticket Creation",
        message: "There was an error creating the ticket.",
        icon: <X />,
        color: "red",
      });
    } finally {
      localStorage.removeItem("listing");
      router.push("/admin/tickets");
    }

    setIsLoading(false);
  };

  const handleSubmit = () => {
    createTicket(null);
  };

  const roylaties = form.values.royalties.map((item, index) => (
    <Paper withBorder p="xl" sx={{ width: "40%" }} key={index}>
      <Group sx={{ width: "100%" }} key={item.walletAddress} mt="xs">
        <Stack sx={{ width: "90%" }}>
          <Text>{index + 1}.</Text>

          <TextInput
            label="NEAR Wallet address"
            placeholder="Enter NEAR wallet address"
            required
            sx={{ flex: 1 }}
            {...form.getInputProps(`royalties.${index}.walletAddress`)}
          />

          <Text>Royalty Percent</Text>
          <Slider
            defaultValue={0.01}
            min={0.01}
            max={0.9}
            label={(value) => `${(value * 100).toFixed(0)}%`}
            step={0.01}
            marks={[
              { value: 0.2, label: "20%" },
              { value: 0.5, label: "50%" },
              { value: 0.8, label: "80%" },
            ]}
            {...form.getInputProps(`royalties.${index}.royaltyPercentage`)}
            onChangeEnd={(value) => {
              form.validateField("royalties");
            }}
          />

          <ActionIcon
            variant="light"
            sx={{ width: "100%" }}
            mt="xl"
            color="red"
            onClick={() => form.removeListItem("royalties", index)}
          >
            <Trash size={16} />
          </ActionIcon>
        </Stack>
      </Group>
    </Paper>
  ));

  return (
    <Box mx="auto">
      <Title mb={8}>Create new Ticket</Title>
      {JSON.stringify(form.values)}
      <form onSubmit={form.onSubmit((values) => handleSubmit())}>
        <fieldset style={{ border: 0 }} disabled={isLoading}>
          <Stack spacing={16}>
            <Text>Image:</Text>
            <FileUpload
              dropzoneText="Choose an image"
              multiple={false}
              onFilesChange={(files) => {
                setMediaFile(files[0]);
              }}
            />

            <Text>After event Image:</Text>
            <FileUpload
              dropzoneText="Choose an after event image"
              multiple={false}
              onFilesChange={(files) => {
                setAfterEventMediaFile(files[0]);
              }}
            />

            <TextInput
              required
              label="Title"
              placeholder="Title"
              {...form.getInputProps("title")}
            />

            <NumberInput
              required
              min={0}
              defaultValue={0.0}
              precision={2}
              step={0.05}
              placeholder="Enter price"
              label="Price"
              description="Enter the price in NEAR (if 0 then free)"
              {...form.getInputProps("price")}
            />

            <NumberInput
              required
              min={0}
              placeholder="Enter stock"
              label="Stock"
              description="Enter the number of tickets available (if 0 then unlimited)"
              {...form.getInputProps("stock")}
            />

            <DatePicker
              defaultValue={
                form?.values.startDate
                  ? new Date(form?.values.startDate)
                  : new Date()
              }
              placeholder="Pick start date"
              label="Ticket sale start date"
              required
              onChange={(date) => {
                form.setFieldValue("startDate", date?.toISOString() ?? "");
              }}
            />

            <TimeInput
              value={
                form?.values.startDate
                  ? new Date(form?.values.startDate)
                  : new Date()
              }
              label="Ticket sale start time"
              required
              onChange={(date) => {
                const newDate = combineTimeAndDate(
                  date,
                  new Date(form?.values.startDate ?? "")
                );
                form.setFieldValue("startDate", newDate.toISOString());
              }}
            />

            <DatePicker
              defaultValue={new Date()}
              placeholder="Pick end date"
              label="Ticket sale end date"
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
              label="Ticket sale end time"
              required
              onChange={(date) => {
                const newDate = combineTimeAndDate(
                  date,
                  new Date(form?.values.endDate ?? "")
                );
                form.setFieldValue("endDate", newDate.toISOString());
              }}
            />

            <Textarea
              placeholder="Description"
              label="Description"
              required
              autosize
              minRows={2}
              maxRows={4}
              {...form.getInputProps("description")}
            />

            {roylaties}

            <Group position="center" mt="md">
              <Button
                onClick={() =>
                  form.insertListItem("royalties", {
                    walletAddress: "",
                    royaltyPercentage: 0,
                  })
                }
              >
                Add royalty
              </Button>
            </Group>

            <Switch
              label="Is this ticket active?"
              size="lg"
              onLabel="Yes"
              offLabel="No"
              {...form.getInputProps("isActive", { type: "checkbox" })}
            />

            <Group position="right" mt="md">
              <Button disabled={isLoading} type="submit">
                Create
              </Button>
            </Group>

            {form.errors.hasOwnProperty("royalties") && (
              <Alert
                icon={<AlertCircle size={16} />}
                title="Royalty percentages must be less than or equal to 90%"
                color="red"
              >
                {form.errors.royalties}
              </Alert>
            )}
          </Stack>
        </fieldset>
      </form>
    </Box>
  );
};

export default CreateTicket;
