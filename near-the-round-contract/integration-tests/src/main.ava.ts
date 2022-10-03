import anyTest, { TestFn } from "ava";
import { utils } from "near-api-js";
import { NEAR, NearAccount, Worker } from "near-workspaces";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  const worker = await Worker.init();

  const root = worker.rootAccount;

  const john = await root.createSubAccount("john", {
    initialBalance: NEAR.parse("3 N").toJSON(),
  });

  const bob = await root.createSubAccount("bob", {
    initialBalance: NEAR.parse("3 N").toJSON(),
  });

  const sam = await root.createSubAccount("sam", {
    initialBalance: NEAR.parse("7 N").toJSON(),
  });

  const treasury = await root.createSubAccount("treasury");

  const contract = await root.devDeploy("../../out/main.wasm");

  await root.call(contract, "new_default_meta", {
    owner_id: john.accountId,
    treasury_id: treasury.accountId,
    royalty_paid_on_buy: false,
  });

  t.context.worker = worker;
  t.context.accounts = { root, contract, bob, john, sam, treasury };
});

test.afterEach(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

const createSeries = async (accounts: Record<string, NearAccount>) => {
  const { contract, john, bob } = accounts;

  await john.call(
    contract,
    "add_whitelisted_creator",
    {
      creator: bob.accountId,
    },
    {
      attachedDeposit: "1",
    }
  );

  await bob.call(
    contract,
    "nft_create_series",
    {
      creator_id: bob.accountId,
      token_metadata: {
        title: "Title",
        description: null,
        media: "media",
        media_hash: null,
        copies: 10,
        issued_at: null,
        expires_at: null,
        starts_at: null,
        updated_at: null,
        extra: null,
        reference: "reference",
        reference_hash: null,
      },
      price: utils.format.parseNearAmount("1"),
      royalty: {
        [bob.accountId]: 1000,
      },
      start_time: null,
      end_time: null,
    },
    {
      gas: "100000000000000",
      attachedDeposit: "5910000000000000000000",
    }
  );
};

test("time", async (t) => {
  const { contract } = t.context.accounts;

  const seconds = await contract.view("get_current_time_seconds");

  t.log(seconds, "Blockchain seconds");
  t.log(new Date().getTime() / 1000, "Local seconds");
});

test("create series", async (t) => {
  const { contract, john, bob } = t.context.accounts;

  const contractStartBalance = await contract.availableBalance();
  const bobStartBalance = await bob.availableBalance();
  const johnStartBalance = await john.availableBalance();

  await createSeries(t.context.accounts);

  const series: any = await contract.view("nft_get_series_single", {
    token_series_id: "1",
  });

  const contractEndBalance = await contract.availableBalance();
  const bobEndBalance = await bob.availableBalance();
  const johnEndBalance = await john.availableBalance();

  t.log("Contract start balance:", contractStartBalance.toHuman());
  t.log("Contract end balance:", contractEndBalance.toHuman());
  t.log(
    "Contract spent balance:",
    contractStartBalance.sub(contractEndBalance).toHuman()
  );

  t.log("John start balance:", johnStartBalance.toHuman());
  t.log("John end balance:", johnEndBalance.toHuman());
  t.log("John spent balance:", johnStartBalance.sub(johnEndBalance).toHuman());

  t.log("Bob start balance:", bobStartBalance.toHuman());
  t.log("Bob end balance:", bobEndBalance.toHuman());
  t.log("Bob spent balance:", bobStartBalance.sub(bobEndBalance).toHuman());

  t.is(series.token_series_id, "1", "token_series_id should be 1");
  t.is(series.creator_id, bob.accountId, "creator_id should be bob");
  t.is(series.metadata.title, "Title", 'title should be "Title #1"');
  t.is(
    series.metadata.reference,
    "reference",
    'reference should be "reference"'
  );
});

test("nft buy", async (t) => {
  const { contract, bob, sam, treasury } = t.context.accounts;

  await createSeries(t.context.accounts);
  const bobStartBalance = await bob.availableBalance();
  const treasuryStartBalance = await treasury.availableBalance();
  const samStartBalance = await sam.availableBalance();

  t.log(
    "Contract start balance:",
    (await contract.availableBalance()).toHuman()
  );

  const result: any = await sam.call(
    contract,
    "nft_buy",
    {
      token_series_id: "1",
    },
    {
      gas: 100000000000000,
      attachedDeposit: utils.format.parseNearAmount("1.009"), //1008120000000000000000000
    }
  );

  t.log("Contract end balance:", (await contract.availableBalance()).toHuman());

  const samEndBalance = await sam.availableBalance();
  const bobEndBalance = await bob.availableBalance();
  const treasuryEndBalance = await treasury.availableBalance();

  const bobRecieved = bobEndBalance.sub(bobStartBalance);
  const treasuryRecieved = treasuryEndBalance.sub(treasuryStartBalance);

  const marketPercent = 500 / 10000;
  const nftPrice = 1;
  const expectedTreasuryToRecieve = nftPrice * marketPercent;
  const expectedNearToRecieve = nftPrice - expectedTreasuryToRecieve;

  t.log("Sam start balance:", samStartBalance.toHuman());
  t.log("Sam end balance:", samEndBalance.toHuman());
  t.log("Sam spent balance:", samStartBalance.sub(samEndBalance).toHuman());

  t.log("Bob will recieve:", bobRecieved.toHuman());
  t.log("Bob start balance:", bobStartBalance.toHuman());
  t.log("Bob end balance:", bobEndBalance.toHuman());

  t.log(
    "Treasury to recieve per transaction:",
    expectedTreasuryToRecieve.toString()
  );
  t.log("Tresury start balance:", treasuryStartBalance.toHuman());
  t.log("Tresury end balance:", treasuryEndBalance.toHuman());

  t.is(
    bobRecieved.toBigInt(),
    NEAR.parse(expectedNearToRecieve.toString()).toBigInt(),
    "bob's balance should be increased by the amount of NFT price minus the amount of NFT price * market percent"
  );
  t.is(
    treasuryRecieved.toBigInt(),
    NEAR.parse(expectedTreasuryToRecieve.toString()).toBigInt(),
    "treasury balance should be increased by the amount of NFT price * market percent"
  );
  t.is(result.token_id, "1:1", "token id should be 1:1");
  t.is(result.owner_id, sam.accountId, "owner id should be sam");
  t.is(result.metadata.title, "Title #1", 'title should be "Title #1"');
});

test("get nft", async (t) => {
  const { contract, bob, sam, treasury } = t.context.accounts;

  await createSeries(t.context.accounts);

  const result: any = await sam.call(
    contract,
    "nft_buy",
    {
      token_series_id: "1",
    },
    {
      gas: 100000000000000,
      attachedDeposit: utils.format.parseNearAmount("1.009"), //1008120000000000000000000
    }
  );

  const nft: any = await contract.view("nft_token", {
    token_id: "1:1",
  });

  t.is(nft.token_id, "1:1", "token id should be 1:1");
});

test("check market fee", async (t) => {
  const { contract } = t.context.accounts;
  const { current_fee }: { current_fee: number } = await contract.view(
    "get_transaction_fee",
    {}
  );

  t.is(current_fee, 500, "market fee should be 500");
});
