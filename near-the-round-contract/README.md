### Kurtosis Local Near

```bash
brew install kurtosis-tech/tap/kurtosis-cli
docker pull kurtosistech/near-kurtosis-module
```

```bash
docker pull kurtosistech/near-kurtosis-module
```

```bash
kurtosis engine start
```

```bash
./launch-local-near-cluster.sh
```

The validator key of the node that it starts is:

```json
{
  "account_id": "test.near",
  "public_key": "ed25519:3Kuyi2DUXdoHgoaNEvCxa1m6G8xqc6Xs7WGajaqLhNmW",
  "secret_key": "ed25519:2ykcMLiM7vCmsSECcgfmUzihBtNdBv7v2CxNi94sNt4R8ar4xsrMMYvtsSNGQDfSRhNWXEnZvgx2wzS9ViBiS9jW"
}
```

The URLs of the services started inside Kurtosis are as follows:

Near node RPC URL: `http://127.0.0.1:8332`

Contract helper service URL: `http://127.0.0.1:8330`

Explorer URL: `http://127.0.0.1:8331`

Wallet URL: `http://127.0.0.1:8334`

To stop your cluster, run the following:

`kurtosis enclave stop near`

To remove your cluster, run:

`kurtosis clean -a`

Stop kurtosis engine:

`kurtosis engine stop`
