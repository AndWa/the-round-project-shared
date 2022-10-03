/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@mantine/core";
import * as nearApi from "near-api-js";
import { AccountView } from "near-api-js/lib/providers/provider";
import { useEffect, useState } from "react";
import { useWalletSelector } from "../../context/WalletSelectorContext";

type Account = AccountView & {
  account_id: string;
};

export interface WalletProps {
  onError: (message: string) => void;
  onUser: (user: { username: string; signedJsonString: string }) => void;
  onSignOut?: () => void | null;
  onButtonClick?: () => void | null;
}

const Wallet = ({ onError, onUser, onSignOut, onButtonClick }: WalletProps) => {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const getAccounts = async () => {
      setLoading(true);
      await signMessage();
      setLoading(false);
    };

    if (accountId && !loading) {
      getAccounts();
    }
  }, [accounts]);

  const handleSignIn = () => {
    modal.show();
    onButtonClick?.();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet
      .signOut()
      .then(() => {
        onSignOut?.();
      })
      .catch((err) => {
        console.log("Failed to sign out");
        console.error(err);
        onError(err.message);
      });
  };

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
    onUser({ username: accountId, signedJsonString: jsonString });
  };

  const handleSwitchWallet = () => {
    modal.show();
  };

  const handleSwitchAccount = () => {
    const currentIndex = accounts.findIndex((x) => x.accountId === accountId);
    const nextIndex = currentIndex < accounts.length - 1 ? currentIndex + 1 : 0;

    const nextAccountId = accounts[nextIndex].accountId;

    selector.setActiveAccount(nextAccountId);

    alert("Switched account to " + nextAccountId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!accountId) {
    return (
      <Button onClick={handleSignIn} fullWidth variant="outline" radius="xl">
        Continue with NEAR wallet
      </Button>
    );
  }

  return (
    <div>
      {onSignOut && <button onClick={handleSignOut}>Sign out</button>}
      {/* <button onClick={handleSwitchWallet}>Switch wallet</button>
      {accounts.length > 1 && (
        <button onClick={handleSwitchAccount}>Switch Account</button>
      )} */}
    </div>
  );
};

export default Wallet;
