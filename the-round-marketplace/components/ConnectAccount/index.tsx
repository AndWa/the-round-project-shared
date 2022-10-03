/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Center, Paper, Text } from "@mantine/core";
import * as nearApi from "near-api-js";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import { useWalletSelector } from "../../context/WalletSelectorContext";
import {
  fetchAuthControllerFirebaseLogin,
  fetchAuthControllerNearLogin,
} from "../../services/api/theRoundComponents";

const ConnectAccount = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [loading, setLoading] = useState<boolean>(false);
  const userData = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (accountId && !loading) {
      setIsLoading(true);
      signMessage();
    }
  }, [accountId]);

  const signMessage = async () => {
    if (!accountId || loading) return;

    const { connect, keyStores } = nearApi;

    const keystore = new keyStores.BrowserLocalStorageKeyStore();

    const connectionConfig: nearApi.ConnectConfig = {
      networkId: "testnet",
      keyStore: keystore,
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
      headers: {},
    };

    const near = await connect(connectionConfig);
    const enc = new TextEncoder();

    const signed = await near.connection.signer.signMessage(
      enc.encode(accountId),
      accountId,
      selector.options.network.networkId
    );

    const jsonString = JSON.stringify(signed);
    onNearUser({ username: accountId, signedJsonString: jsonString });
  };

  const onError = (message: string) => {
    console.log(message);
  };

  const onFirebaseUser = async (user: {
    jwt: string;
    uid: string;
    email: string;
  }) => {
    console.log(user);
    const { token } = await fetchAuthControllerFirebaseLogin({
      body: {
        jwt: user.jwt,
      },
    });

    console.log(token);
    userData.onLogin(token);
    setIsLoading(false);
    router.push("/");
  };

  const onNearUser = useCallback(
    async (user: { username: string; signedJsonString: string }) => {
      if (localStorage.getItem("token")) return;

      setIsLoading(true);
      console.log(new Date());
      console.log(user);
      const { token } = await fetchAuthControllerNearLogin({
        body: {
          signedJsonString: user.signedJsonString,
          username: user.username,
        },
      });

      console.log(token);
      userData.onLogin(token);
      setIsLoading(false);
      router.push("/");
    },
    []
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Paper radius="md" p="xl" sx={{ width: "100%" }}>
      <Text size="lg" weight={500} align="center">
        Connect with your account
      </Text>

      {/* <Group grow mb="md" mt="md">
        <Center>
          <GoogleSignInButton onError={onError} onUser={onFirebaseUser} />
        </Center>
      </Group>

      <Divider label="Or" labelPosition="center" my="lg" /> */}
      <Center>
        <Button
          onClick={() => {
            modal.show();
          }}
          fullWidth
          variant="outline"
          radius="xl"
        >
          Continue with NEAR wallet
        </Button>
      </Center>
    </Paper>
  );
};

export default ConnectAccount;
