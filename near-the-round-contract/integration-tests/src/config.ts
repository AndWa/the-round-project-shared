import fs from 'fs';
import { KeyPair, keyStores } from 'near-api-js';

const CONTRACT_NAME = fs.readFileSync('../neardev/dev-account', 'utf-8');
const NETWORK_ID = 'local';

// Create an InMemoryKeyStore
const keyStore = new keyStores.InMemoryKeyStore();

// Load credentials
const credPath = `${process.env.HOME}/.near-credentials/${NETWORK_ID}/${CONTRACT_NAME}.json`;
const credentials = JSON.parse(fs.readFileSync(credPath) as unknown as string);

// Save key in the key store
keyStore.setKey(
  NETWORK_ID,
  CONTRACT_NAME,
  KeyPair.fromString(credentials.private_key),
);

export const nearConfig =
  NETWORK_ID === 'local'
    ? {
        networkId: NETWORK_ID,
        nodeUrl: 'http://127.0.0.1:8332',
        contractName: CONTRACT_NAME,
        walletUrl: 'http://127.0.0.1:8334',
        helperUrl: 'http://127.0.0.1:8330',
        explorerUrl: 'http://127.0.0.1:8331',
        headers: {},
        deps: { keyStore },
      }
    : {
        networkId: NETWORK_ID,
        nodeUrl: 'https://rpc.testnet.near.org',
        contractName: CONTRACT_NAME,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        headers: {},
        deps: { keyStore },
      };
