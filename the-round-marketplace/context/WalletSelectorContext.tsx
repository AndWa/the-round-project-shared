import type { AccountState, WalletSelector } from "@near-wallet-selector/core";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import * as nearApi from "near-api-js";
import { Account, utils } from "near-api-js";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { debounce, distinctUntilChanged, map, timer } from "rxjs";
declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

type SmartContractResult = Promise<FinalExecutionOutcome | null | undefined>;

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
  account: Account | null;
  nearConnection: nearApi.Near | null;
  refreshAccountData: () => void;
  onNewAccountId?: (accountId: string) => void;
  callContract: (
    methodName: string,
    args: Record<string, any>,
    deposit: string
  ) => SmartContractResult;
  toggleWhitelistUser: (
    accountId: string,
    shouldWhitelist: boolean
  ) => SmartContractResult;
  buyNft: (tokenSeriesId: string, price: number) => SmartContractResult;
  createSeries: (
    creatorId: string,
    title: string,
    description: string,
    media: string,
    reference: string,
    royalty: Record<string, number>,
    startTime: Date,
    endTime: Date | null,
    copies: number | null,
    price: number | null,
    extra: Record<string, any> | null
  ) => SmartContractResult;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider = ({ children }: any) => {
  const [nearConnection, setNearConnection] = useState<nearApi.Near | null>(
    null
  );

  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  const createSeries = async (
    creatorId: string,
    title: string,
    description: string,
    media: string,
    reference: string,
    royalty: Record<string, number>,
    startTime: Date,
    endTime: Date | null,
    copies: number | null,
    price: number | null,
    extra: Record<string, any> | null
  ) => {
    return callContract(
      "nft_create_series",
      {
        creator_id: creatorId,
        token_metadata: {
          title,
          description,
          media,
          media_hash: null,
          copies: copies === 0 ? null : copies,
          issued_at: null,
          expires_at: null,
          starts_at: null,
          updated_at: null,
          extra: extra ? JSON.stringify(extra) : null,
          reference: null, // TODO: reference,
          reference_hash: null,
        },
        price: price ? utils.format.parseNearAmount(price.toString()) : "0",
        royalty,
        start_time: startTime ? Math.round(startTime.getTime() / 1000) : null,
        end_time: endTime ? Math.round(endTime.getTime() / 1000) : null,
      },
      "6110000000000000000000"
    );
  };

  const buyNft = async (tokenSeriesId: string, price: number) => {
    const priceWithStorage = price + 0.009;
    const deposit = utils.format.parseNearAmount(priceWithStorage.toString());
    if (!deposit) throw new Error("Price is not valid.");

    return callContract("nft_buy", { token_series_id: tokenSeriesId }, deposit);
  };

  const toggleWhitelistUser = async (
    accountId: string,
    shouldWhitelist: boolean
  ) => {
    const methodName = shouldWhitelist
      ? "add_whitelisted_creator"
      : "remove_whitelisted_creator";
    return callContract(methodName, { creator: accountId }, "1");
  };

  const callContract = async (
    methodName: string,
    args: Record<string, any>,
    deposit: string
  ) => {
    if (!selector || !accountId) return;
    console.log("Calling contract", methodName, args);

    const { contract } = selector.store.getState();
    const wallet = await selector.wallet();

    try {
      const result = await wallet.signAndSendTransaction({
        signerId: accountId!,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: methodName,
              args: args,
              gas: "100000000000000",
              deposit: deposit,
            },
          },
        ],
      });

      return result as FinalExecutionOutcome;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const refreshAccountData = useCallback(async () => {
    if (accountId) {
      await nearConnection?.account(accountId).then((account) => {
        setAccount(account);
      });
    }
  }, []);

  const init = useCallback(async () => {
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

    const nearConnection = await connect(connectionConfig);

    setNearConnection(nearConnection);

    const _selector = await setupWalletSelector({
      network: "testnet",
      debug: true,
      modules: [
        setupNearWallet({
          iconUrl:
            "https://raw.githubusercontent.com/near/wallet-selector/main/packages/near-wallet/assets/near-wallet-icon.png",
        }),
        setupMyNearWallet({
          iconUrl:
            "https://raw.githubusercontent.com/near/wallet-selector/main/packages/my-near-wallet/assets/my-near-wallet-icon.png",
        }),
        // setupSender(),
        // setupMathWallet(),
        // setupNightly(),
        // setupLedger(),
        // setupWalletConnect({
        //   projectId: "c4f79cc...",
        //   metadata: {
        //     name: "NEAR Wallet Selector",
        //     description: "Example dApp used by NEAR Wallet Selector",
        //     url: "https://github.com/near/wallet-selector",
        //     icons: ["https://avatars.githubusercontent.com/u/37784886"],
        //   },
        // }),
        // setupNightlyConnect({
        //   url: "wss://ncproxy.nightly.app/app",
        //   appMetadata: {
        //     additionalInfo: "",
        //     application: "NEAR Wallet Selector",
        //     description: "Example dApp used by NEAR Wallet Selector",
        //     icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
        //   },
        // }),
      ],
    });
    const _modal = setupModal(_selector, {
      contractId: "round.testnet",
    });
    const state = _selector.store.getState();

    setAccounts(state.accounts);

    window.selector = _selector;
    window.modal = _modal;

    setSelector(_selector);
    setModal(_modal);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        debounce(() => timer(1000)),
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        console.log("Accounts Update", nextAccounts);

        setAccounts(nextAccounts);
      });

    const aId = accounts.find((account) => account.active)?.accountId || null;

    if (aId !== accountId) {
      console.log("Account changed", aId);
      setAccountId(aId);

      if (aId) {
        nearConnection?.account(aId).then((account) => {
          setAccount(account);
        });
      }
    }

    return () => subscription.unsubscribe();
  }, [selector, accounts]);

  if (!selector || !modal) {
    return null;
  }

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        account,
        nearConnection,
        refreshAccountData,
        callContract,
        toggleWhitelistUser,
        buyNft,
        createSeries,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
