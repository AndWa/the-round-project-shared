import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { NextPage } from "next";
import { AlertCircle, Check, X } from "tabler-icons-react";
import { useWalletSelector } from "../../../context/WalletSelectorContext";
import {
  fetchUserControllerAddToWhitelist,
  fetchUserControllerRemoveFromWhitelist,
  fetchUserControllerUpdate,
  useUserControllerFindAll,
} from "../../../services/api/theRoundComponents";
import { User } from "../../../services/api/theRoundSchemas";

const Users: NextPage = () => {
  const { toggleWhitelistUser } = useWalletSelector();
  const { data, isLoading, error, refetch } = useUserControllerFindAll({});

  const openDeactivateModal = (user: User) =>
    openConfirmModal({
      title: `${user.isActive ? "Deactivate" : "Activate"} user`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to {user.isActive ? "deactivate" : "activate"}{" "}
          <b>{user.username}</b>?
        </Text>
      ),
      labels: {
        confirm: user.isActive ? "Deactivate" : "Activate",
        cancel: "No",
      },
      confirmProps: { color: "red" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => onDeactivate((user as any)._id, !user.isActive),
    });

  const openTogglePromoteModal = (user: User) =>
    openConfirmModal({
      title: `${user.roles.includes("venue") ? "Unpromote" : "Promote"} user`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to{" "}
          {user.roles.includes("venue") ? "unpromote" : "promote"}{" "}
          <b>{user.username}</b> as venue provider?
        </Text>
      ),
      labels: {
        confirm: user.roles.includes("venue") ? "Unpromote" : "Promote",
        cancel: "No",
      },
      confirmProps: { color: "cyan" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () =>
        onPromote(
          (user as any)._id,
          user.nearWalletAccountId,
          !user.roles.includes("venue")
        ),
    });

  const onPromote = async (
    id: string,
    walletId: string,
    shouldPromote: boolean
  ) => {
    try {
      const result = await toggleWhitelistUser(walletId, shouldPromote);
      console.log(result);

      if (null) {
        showNotification({
          title: "Error",
          message: "Something went wrong",
          color: "red",
        });
        return;
      }

      const user = shouldPromote
        ? await fetchUserControllerAddToWhitelist({
            pathParams: {
              id,
            },
          })
        : await fetchUserControllerRemoveFromWhitelist({
            pathParams: {
              id,
            },
          });

      console.log(user);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  const onDeactivate = async (id: string, shouldActivate: boolean) => {
    try {
      const user = await fetchUserControllerUpdate({
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
    <tr key={element.uid}>
      <td>{element.username}</td>
      <td>{element.isActive ? <Check /> : <X />}</td>
      <td>{element.isCensored ? <Check /> : <X />}</td>
      <td>
        <Group spacing="xs">
          {element.roles.map((role) => (
            <Badge key={role}>{role}</Badge>
          ))}
        </Group>
      </td>
      <td>
        <Badge>{element.accountType}</Badge>
      </td>
      <td>
        <Group>
          {element.accountType === "near" && (
            <Button onClick={() => openTogglePromoteModal(element)}>
              {element.roles.includes("venue") ? "Unpromote as" : "Promote to"}{" "}
              Venue
            </Button>
          )}

          <Button color="red" onClick={() => openDeactivateModal(element)}>
            {element.isActive ? "Deactivate" : "Activate"}
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
      <Paper sx={{ width: "100%" }} shadow="sm" p="md" withBorder>
        <Alert
          mb={16}
          icon={<AlertCircle size={32} />}
          title="Account Promotion"
        >
          You can only promote <b>NEAR</b> user types to venue providers because
          they have connected with their wallet.
        </Alert>

        <Table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Active</th>
              <th>Censored</th>
              <th>Roles</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default Users;
