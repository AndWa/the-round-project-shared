use std::collections::HashMap;

use near_contract_standards::non_fungible_token::core::{
    NonFungibleTokenCore, NonFungibleTokenResolver,
};
use near_contract_standards::non_fungible_token::events::NftMint;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, UnorderedMap, UnorderedSet};
use near_sdk::env::is_valid_account_id;
use near_sdk::json_types::{U128, U64};
use near_sdk::serde_json::json;
use near_sdk::{
    assert_one_yocto, env, near_bindgen, AccountId, Balance, BorshStorageKey, PanicOnDefault,
    Promise, PromiseOrValue, Timestamp,
};
use serde::{Deserialize, Serialize};

pub use crate::payout::Payout;

mod payout;

pub const TOKEN_DELIMETER: char = ':';
pub const TITLE_DELIMETER: &str = " #";

const MAX_PRICE: Balance = 1_000_000_000 * 10u128.pow(24);

pub type TokenSeriesId = String;
pub type TimestampSec = u32;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct TokenSeries {
    metadata: TokenMetadata,
    creator_id: AccountId,
    tokens: UnorderedSet<TokenId>,
    price: Option<Balance>,
    is_mintable: bool,
    royalty: HashMap<AccountId, u32>,
    start_time: Option<TimestampSec>,
    end_time: Option<TimestampSec>,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenSeriesJson {
    token_series_id: TokenSeriesId,
    metadata: TokenMetadata,
    creator_id: AccountId,
    royalty: HashMap<AccountId, u32>,
    transaction_fee: Option<U128>,
    start_time: Option<TimestampSec>,
    end_time: Option<TimestampSec>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TransactionFee {
    pub next_fee: Option<u16>,
    pub start_time: Option<TimestampSec>,
    pub current_fee: u16,
}

#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct MarketDataTransactionFee {
    pub transaction_fee: UnorderedMap<TokenSeriesId, u128>,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    // Additional data for the contract
    token_series_by_id: UnorderedMap<TokenSeriesId, TokenSeries>,
    treasury_id: AccountId,
    transaction_fee: TransactionFee,
    market_data_transaction_fee: MarketDataTransactionFee,
    whitelisted_creators: UnorderedSet<AccountId>,
    royalty_paid_on_buy: bool,
}

const DATA_IMAGE_SVG_NFT_ICON: &str = "";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
    // Additional data for contract
    TokenSeriesById,
    TokensBySeriesInner { token_series: String },
    MarketDataTransactionFee,
    WhitelistedCreators,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(
        owner_id: AccountId,
        treasury_id: AccountId,
        royalty_paid_on_buy: bool,
    ) -> Self {
        Self::new(
            owner_id,
            treasury_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "The Round Collectibles".to_string(),
                symbol: "TRND".to_string(),
                icon: Some(DATA_IMAGE_SVG_NFT_ICON.to_string()),
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
            500,
            royalty_paid_on_buy,
        )
    }

    #[init]
    pub fn new(
        owner_id: AccountId,
        treasury_id: AccountId,
        metadata: NFTContractMetadata,
        current_fee: u16,
        royalty_paid_on_buy: bool,
    ) -> Self {
        metadata.assert_valid();
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            token_series_by_id: UnorderedMap::new(StorageKey::TokenSeriesById),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            treasury_id: treasury_id,
            transaction_fee: TransactionFee {
                next_fee: None,
                start_time: None,
                current_fee,
            },
            market_data_transaction_fee: MarketDataTransactionFee {
                transaction_fee: UnorderedMap::new(StorageKey::MarketDataTransactionFee),
            },
            whitelisted_creators: UnorderedSet::new(StorageKey::WhitelistedCreators),
            royalty_paid_on_buy,
        }
    }

    // Transaction fees
    #[payable]
    pub fn set_transaction_fee(&mut self, next_fee: u16, start_time: Option<TimestampSec>) {
        assert_one_yocto();
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Marketplace: Owner only"
        );

        assert!(
            next_fee < 10_000,
            "Marketplace: transaction fee is more than 10_000"
        );

        if start_time.is_none() {
            self.transaction_fee.current_fee = next_fee;
            self.transaction_fee.next_fee = None;
            self.transaction_fee.start_time = None;
            return;
        } else {
            let start_time: TimestampSec = start_time.unwrap();
            assert!(
                start_time > to_sec(env::block_timestamp()),
                "start_time is less than current block_timestamp"
            );
            self.transaction_fee.next_fee = Some(next_fee);
            self.transaction_fee.start_time = Some(start_time);
        }
    }

    pub fn calculate_market_data_transaction_fee(
        &mut self,
        token_series_id: &TokenSeriesId,
    ) -> u128 {
        if let Some(transaction_fee) = self
            .market_data_transaction_fee
            .transaction_fee
            .get(&token_series_id)
        {
            return transaction_fee;
        }

        // fallback to default transaction fee
        self.calculate_current_transaction_fee()
    }

    pub fn calculate_current_transaction_fee(&mut self) -> u128 {
        let transaction_fee: &TransactionFee = &self.transaction_fee;
        if transaction_fee.next_fee.is_some() {
            if to_sec(env::block_timestamp()) >= transaction_fee.start_time.unwrap() {
                self.transaction_fee.current_fee = transaction_fee.next_fee.unwrap();
                self.transaction_fee.next_fee = None;
                self.transaction_fee.start_time = None;
            }
        }
        self.transaction_fee.current_fee as u128
    }

    pub fn get_transaction_fee(&self) -> &TransactionFee {
        &self.transaction_fee
    }

    pub fn get_market_data_transaction_fee(&self, token_series_id: &TokenId) -> u128 {
        if let Some(transaction_fee) = self
            .market_data_transaction_fee
            .transaction_fee
            .get(&token_series_id)
        {
            return transaction_fee;
        }
        // fallback to default transaction fee
        self.transaction_fee.current_fee as u128
    }

    #[payable]
    pub fn set_market_data_transaction_fee(&mut self, token_series_id: &TokenSeriesId, fee: u128) {
        assert_one_yocto();
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Marketplace: Owner only"
        );

        assert!(
            fee < 10_000,
            "Marketplace: transaction fee is more than 10_000"
        );

        self.market_data_transaction_fee
            .transaction_fee
            .insert(token_series_id, &fee);
    }

    // Whitelisting
    #[payable]
    pub fn add_whitelisted_creator(&mut self, creator: AccountId) {
        assert_one_yocto();
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Marketplace: Owner only"
        );
        self.whitelisted_creators.insert(&creator);
    }

    #[payable]
    pub fn remove_whitelisted_creator(&mut self, creator: AccountId) {
        assert_one_yocto();
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Marketplace: Owner only"
        );
        self.whitelisted_creators.remove(&creator);
    }

    pub fn get_whitelist(&self) -> Vec<AccountId> {
        self.whitelisted_creators.to_vec()
    }

    // Royalty paid on buy
    pub fn get_royalty_paid_on_buy(&self) -> bool {
        self.royalty_paid_on_buy
    }

    #[payable]
    pub fn set_royalty_paid_on_buy(&mut self, royalty_paid_on_buy: bool) {
        assert_one_yocto();
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Marketplace: Owner only"
        );
        self.royalty_paid_on_buy = royalty_paid_on_buy;
    }

    // Treasury
    #[payable]
    pub fn set_treasury(&mut self, treasury_id: AccountId) {
        assert_one_yocto();
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Marketplace: Owner only"
        );
        self.treasury_id = treasury_id;
    }

    // Series
    #[payable]
    pub fn set_nft_series_sale_time(
        &mut self,
        token_series_id: &TokenSeriesId,
        start_time: Option<TimestampSec>,
        end_time: Option<TimestampSec>,
    ) {
        assert_one_yocto();
        assert!(
            env::predecessor_account_id() == self.tokens.owner_id
                || env::predecessor_account_id() == self.tokens.owner_id,
            "Marketplace: Not allowed"
        );

        let mut token_series = self
            .token_series_by_id
            .get(token_series_id)
            .expect("Marketplace: Token series not exist");

        if start_time.is_some() && end_time.is_some() {
            assert!(
                start_time.unwrap() > end_time.unwrap(),
                "start_time is less than end_time"
            );

            token_series.start_time = start_time;
            token_series.end_time = end_time;
            self.token_series_by_id
                .insert(token_series_id, &token_series);
        } else {
            if start_time.is_some() {
                assert!(
                    start_time.unwrap() > to_sec(env::block_timestamp()),
                    "start_time is less than current block_timestamp"
                );

                if token_series.end_time.is_some() {
                    assert!(
                        start_time.unwrap() < token_series.end_time.unwrap(),
                        "start_time is less than token series end_time"
                    );
                }

                token_series.start_time = start_time;
            }

            if end_time.is_some() {
                assert!(
                    end_time.unwrap() > to_sec(env::block_timestamp()),
                    "end_time is less than current block_timestamp"
                );

                if token_series.start_time.is_some() {
                    assert!(
                        end_time.unwrap() > token_series.start_time.unwrap(),
                        "end_time is greater than token series start_time"
                    );
                }

                token_series.end_time = end_time;
            }

            self.token_series_by_id
                .insert(token_series_id, &token_series);
        }
    }

    #[payable]
    pub fn set_nft_series_is_mintable(
        &mut self,
        token_series_id: &TokenSeriesId,
        is_mintable: bool,
    ) {
        assert_one_yocto();
        assert!(
            env::predecessor_account_id() == self.tokens.owner_id
                || env::predecessor_account_id() == self.tokens.owner_id,
            "Marketplace: Not allowed"
        );

        let mut token_series = self
            .token_series_by_id
            .get(token_series_id)
            .expect("Marketplace: Token series not exist");

        token_series.is_mintable = is_mintable;
        self.token_series_by_id
            .insert(token_series_id, &token_series);
    }

    #[payable]
    pub fn nft_create_series(
        &mut self,
        creator_id: Option<AccountId>,
        token_metadata: TokenMetadata,
        price: Option<U128>,
        royalty: Option<HashMap<AccountId, u32>>,
        start_time: Option<TimestampSec>,
        end_time: Option<TimestampSec>,
    ) -> TokenSeriesJson {
        assert!(
            self.whitelisted_creators
                .contains(&env::predecessor_account_id())
                || env::predecessor_account_id() == self.tokens.owner_id,
            "Marketplace: Creator must be whitelisted"
        );

        let initial_storage_usage = env::storage_usage();
        let caller_id = env::predecessor_account_id();

        if creator_id.is_some() {
            assert_eq!(
                creator_id.unwrap(),
                caller_id,
                "Marketplace: Caller is not creator_id"
            );
        }

        let token_series_id = format!("{}", (self.token_series_by_id.len() + 1));

        assert!(
            self.token_series_by_id.get(&token_series_id).is_none(),
            "Marketplace: duplicate token_series_id"
        );

        let title = token_metadata.title.clone();

        assert!(
            title.is_some(),
            "Marketplace: token_metadata.title is required"
        );

        let mut total_perpetual = 0;
        let mut total_accounts = 0;
        let royalty_res: HashMap<AccountId, u32> = if let Some(royalty) = royalty {
            for (k, v) in royalty.iter() {
                if !is_valid_account_id(k.as_bytes()) {
                    env::panic_str("Not valid account_id for royalty");
                };
                total_perpetual += *v;
                total_accounts += 1;
            }
            royalty
        } else {
            HashMap::new()
        };

        assert!(
            total_accounts <= 50,
            "Marketplace: royalty exceeds 50 accounts"
        );

        assert!(
            total_perpetual <= 9000,
            "Marketplace Exceeds maximum royalty -> 9000",
        );

        let price_res: Option<u128> = if price.is_some() {
            assert!(
                price.unwrap().0 < MAX_PRICE,
                "Marketplace: price higher than {}",
                MAX_PRICE
            );
            Some(price.unwrap().0)
        } else {
            None
        };

        let mut update_metadata = token_metadata.clone();

        update_metadata.media = Some(format!(
            "{}/{}/media",
            update_metadata.media.unwrap(),
            token_series_id
        ));

        self.token_series_by_id.insert(
            &token_series_id,
            &TokenSeries {
                metadata: update_metadata.clone(),
                creator_id: caller_id,
                tokens: UnorderedSet::new(
                    StorageKey::TokensBySeriesInner {
                        token_series: token_series_id.clone(),
                    }
                    .try_to_vec()
                    .unwrap(),
                ),
                price: price_res,
                is_mintable: true,
                royalty: royalty_res.clone(),
                start_time,
                end_time,
            },
        );

        // set market data transaction fee
        let current_transaction_fee = self.calculate_current_transaction_fee();
        self.market_data_transaction_fee
            .transaction_fee
            .insert(&token_series_id, &current_transaction_fee);

        let log_data = &json!({
            "standard":"nep171",
            "version":"1.0.0",
            "event":"nft_series_mint",
            "data": {
                    "token_series_id": token_series_id,
                    "token_metadata": token_metadata,
                    "creator_id": env::predecessor_account_id(),
                    "price": price,
                    "royalty": royalty_res,
                    "transaction_fee": &current_transaction_fee.to_string()
            }
        })
        .to_string();

        let event = format!("{}{}", "EVENT_JSON:", log_data);

        env::log_str(&event);

        refund_deposit(env::storage_usage() - initial_storage_usage, 0);

        TokenSeriesJson {
            token_series_id,
            metadata: token_metadata,
            creator_id: env::predecessor_account_id(),
            royalty: royalty_res,
            transaction_fee: Some(current_transaction_fee.into()),
            start_time,
            end_time,
        }
    }

    #[payable]
    pub fn nft_buy(&mut self, token_series_id: TokenSeriesId) -> Token {
        let initial_storage_usage = env::storage_usage();
        let attached_deposit = env::attached_deposit();
        let receiver_id = env::predecessor_account_id();
        let token_series = self
            .token_series_by_id
            .get(&token_series_id)
            .expect("Marketplace: Token series not exist");

        let price: u128 = token_series.price.expect("Marketplace: not for sale");

        assert!(
            attached_deposit >= price,
            "Marketplace: attached deposit is less than price : {}",
            price
        );

        // Mint token
        let token: Token = self._nft_mint_series(token_series_id.clone(), receiver_id);

        // Calculate transaction fee
        let for_treasury = price as u128
            * self.calculate_market_data_transaction_fee(&token_series_id)
            / 10_000u128;

        // Calculate leftover deposit
        let price_deducted = price - for_treasury;

        // Transfer transaction fee to treasury
        if for_treasury != 0 {
            Promise::new(self.treasury_id.clone()).transfer(for_treasury);
        }

        // Check if there are royalties to be paid and if they should be paid
        if self.royalty_paid_on_buy && token_series.royalty.len() > 0 {
            assert!(
                token_series.royalty.len() as u32 <= 50,
                "Market cannot payout to that many receivers"
            );

            let mut payout: Payout = Payout {
                payout: HashMap::new(),
            };

            let mut total_perpetual = 0;

            // Calculate royalties
            for (k, v) in token_series.royalty.iter() {
                // Makes sure that token_series creator is ignored for initial buy payout
                if *k != token_series.creator_id {
                    let key = k.clone();
                    payout
                        .payout
                        .insert(key, royalty_to_payout(*v, price_deducted));
                    total_perpetual += *v;
                }
            }

            // Payout to token_series creator
            payout.payout.insert(
                token_series.creator_id.clone(),
                royalty_to_payout(10000 - total_perpetual, price_deducted),
            );

            // Execute payments
            payout.payout.iter().for_each(|(k, v)| {
                Promise::new(k.clone()).transfer(v.0);
            });
        } else {
            // Pay leftover deposit to token_series creator
            Promise::new(token_series.creator_id).transfer(price_deducted);
        }

        refund_deposit(env::storage_usage() - initial_storage_usage, price);

        token
    }

    #[payable]
    pub fn nft_mint(&mut self, token_series_id: TokenSeriesId, receiver_id: AccountId) -> Token {
        let initial_storage_usage = env::storage_usage();

        let token_series = self
            .token_series_by_id
            .get(&token_series_id)
            .expect("Marketplace: Token series not exist");

        assert_eq!(
            env::predecessor_account_id(),
            token_series.creator_id,
            "Marketplace: not creator"
        );

        let token: Token = self._nft_mint_series(token_series_id, receiver_id);

        refund_deposit(env::storage_usage() - initial_storage_usage, 0);

        token
    }

    fn _nft_mint_series(
        &mut self,
        token_series_id: TokenSeriesId,
        receiver_id: AccountId,
    ) -> Token {
        let mut token_series = self
            .token_series_by_id
            .get(&token_series_id)
            .expect("Marketplace: Token series not exist");
        assert!(
            token_series.is_mintable,
            "Marketplace: Token series is not mintable"
        );

        if token_series.start_time.is_some() {
            assert!(
                token_series.start_time.unwrap() < to_sec(env::block_timestamp()),
                "Marketplace: Token series sale not started yet"
            );
        }

        if token_series.end_time.is_some() {
            assert!(
                token_series.end_time.unwrap() > to_sec(env::block_timestamp()),
                "Marketplace: Token series sale ended"
            );
        }

        let num_tokens = token_series.tokens.len();

        if token_series.metadata.copies.is_some() {
            let max_copies = token_series.metadata.copies.unwrap_or(u64::MAX);
            assert!(num_tokens < max_copies, "Series supply maxed");

            if (num_tokens + 1) >= max_copies {
                token_series.is_mintable = false;
                token_series.price = None;
            }
        }

        let token_id = format!("{}{}{}", &token_series_id, TOKEN_DELIMETER, num_tokens + 1);
        token_series.tokens.insert(&token_id);
        self.token_series_by_id
            .insert(&token_series_id, &token_series);

        let token_metadata = TokenMetadata {
            title: token_series.metadata.title, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
            description: token_series.metadata.description, // free-form description
            media: token_series.metadata.media, // URL to associated media, preferably to decentralized, content-addressed storage
            media_hash: token_series.metadata.media_hash, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
            copies: token_series.metadata.copies, // number of copies of this set of metadata in existence when token was minted.
            issued_at: Some(env::block_timestamp().to_string()), // ISO 8601 datetime when token was issued or minted
            expires_at: token_series.metadata.expires_at, // ISO 8601 datetime when token expires
            starts_at: token_series.metadata.starts_at, // ISO 8601 datetime when token starts being valid
            updated_at: token_series.metadata.updated_at, // ISO 8601 datetime when token was last updated
            extra: token_series.metadata.extra, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
            reference: token_series.metadata.reference, // URL to an off-chain JSON file with more info.
            reference_hash: token_series.metadata.reference_hash, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
        };

        let owner_id: AccountId = receiver_id;
        let token =
            self.tokens
                .internal_mint_with_refund(token_id, owner_id, Some(token_metadata), None);

        NftMint {
            owner_id: &token.owner_id,
            token_ids: &[&token.token_id],
            memo: None,
        }
        .emit();

        let log_data = &json!({
            "standard":"nep171",
            "version":"1.0.0",
            "event":"nft_claimed",
            "data": {
                "token_series_id": token_series_id,
            }
        })
        .to_string();

        let event = format!("{}{}", "EVENT_JSON:", log_data);

        env::log_str(&event);

        self.nft_token(token.token_id)
            .expect("Marketplace: Token doesn't exist")
    }

    #[payable]
    pub fn nft_decrease_series_copies(
        &mut self,
        token_series_id: TokenSeriesId,
        decrease_copies: U64,
    ) -> U64 {
        assert_one_yocto();

        let mut token_series = self
            .token_series_by_id
            .get(&token_series_id)
            .expect("Token series not exist");
        assert_eq!(
            env::predecessor_account_id(),
            token_series.creator_id,
            "Marketplace: Creator only"
        );

        let minted_copies = token_series.tokens.len();
        let copies = token_series.metadata.copies.unwrap();

        assert!(
            (copies - decrease_copies.0) >= minted_copies,
            "Marketplace: cannot decrease supply, already minted : {}",
            minted_copies
        );

        let is_non_mintable = if (copies - decrease_copies.0) == minted_copies {
            token_series.is_mintable = false;
            true
        } else {
            false
        };

        token_series.metadata.copies = Some(copies - decrease_copies.0);

        self.token_series_by_id
            .insert(&token_series_id, &token_series);

        let log_data = &json!({
            "standard":"nep171",
            "version":"1.0.0",
            "event":"nft_decrease_series_copies",
            "data": {
                    "token_series_id": token_series_id,
                    "copies": U64::from(token_series.metadata.copies.unwrap()),
                    "is_non_mintable": is_non_mintable,
            }
        })
        .to_string();

        let event = format!("{}{}", "EVENT_JSON:", log_data);

        env::log_str(&event);

        U64::from(token_series.metadata.copies.unwrap())
    }

    #[payable]
    pub fn nft_set_series_price(
        &mut self,
        token_series_id: TokenSeriesId,
        price: Option<U128>,
    ) -> Option<U128> {
        assert_one_yocto();

        let mut token_series = self
            .token_series_by_id
            .get(&token_series_id)
            .expect("Token series not exist");
        assert_eq!(
            env::predecessor_account_id(),
            token_series.creator_id,
            "Marketplace: Creator only"
        );

        assert_eq!(
            token_series.is_mintable, true,
            "Marketplace: token series is not mintable"
        );

        if price.is_none() {
            token_series.price = None;
        } else {
            assert!(
                price.unwrap().0 < MAX_PRICE,
                "Marketplace: price higher than {}",
                MAX_PRICE
            );
            token_series.price = Some(price.unwrap().0);
        }

        self.token_series_by_id
            .insert(&token_series_id, &token_series);

        // set market data transaction fee
        let current_transaction_fee = self.calculate_current_transaction_fee();
        self.market_data_transaction_fee
            .transaction_fee
            .insert(&token_series_id, &current_transaction_fee);

        let log_data = &json!({
            "standard":"nep171",
            "version":"1.0.0",
            "event":"nft_set_series_price",
            "data":  {
                    "token_series_id": token_series_id,
                    "price": price,
                    "transaction_fee": current_transaction_fee.to_string()
            }
        })
        .to_string();

        let event = format!("{}{}", "EVENT_JSON:", log_data);

        env::log_str(&event);

        return price;
    }

    // CUSTOM VIEWS
    pub fn nft_get_series_single(&self, token_series_id: TokenSeriesId) -> TokenSeriesJson {
        let token_series = self
            .token_series_by_id
            .get(&token_series_id)
            .expect("Series does not exist");
        let current_transaction_fee = self.get_market_data_transaction_fee(&token_series_id);
        TokenSeriesJson {
            token_series_id,
            metadata: token_series.metadata,
            creator_id: token_series.creator_id,
            royalty: token_series.royalty,
            transaction_fee: Some(current_transaction_fee.into()),
            start_time: token_series.start_time,
            end_time: token_series.end_time,
        }
    }

    pub fn nft_get_series_price(self, token_series_id: TokenSeriesId) -> Option<U128> {
        let price = self.token_series_by_id.get(&token_series_id).unwrap().price;
        match price {
            Some(p) => return Some(U128::from(p)),
            None => return None,
        };
    }

    pub fn nft_supply_for_series(&self, token_series_id: TokenSeriesId) -> U64 {
        self.token_series_by_id
            .get(&token_series_id)
            .expect("Token series not exist")
            .tokens
            .len()
            .into()
    }

    pub fn get_current_time_seconds(&self) -> TimestampSec {
        to_sec(env::block_timestamp())
    }
}

fn royalty_to_payout(a: u32, b: Balance) -> U128 {
    U128(a as u128 * b / 10_000u128)
}

fn refund_deposit(storage_used: u64, extra_spend: Balance) {
    let required_cost = env::storage_byte_cost() * Balance::from(storage_used);
    let attached_deposit = env::attached_deposit() - extra_spend;

    assert!(
        required_cost <= attached_deposit,
        "Must attach {} yoctoNEAR to cover storage",
        required_cost,
    );

    let refund = attached_deposit - required_cost;
    if refund > 1 {
        Promise::new(env::predecessor_account_id()).transfer(refund);
    }
}

fn to_sec(timestamp: Timestamp) -> TimestampSec {
    (timestamp / 10u64.pow(9)) as u32
}

near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}

#[near_bindgen]
impl NonFungibleTokenCore for Contract {
    fn nft_token(&self, token_id: TokenId) -> Option<Token> {
        let owner_id = self.tokens.owner_by_id.get(&token_id)?;
        let approved_account_ids = self
            .tokens
            .approvals_by_id
            .as_ref()
            .and_then(|by_id| by_id.get(&token_id).or_else(|| Some(HashMap::new())));

        // CUSTOM Implementation (switch token metadata for the token_series metadata)
        let mut token_id_iter = token_id.split(TOKEN_DELIMETER);
        let token_series_id = token_id_iter.next().unwrap().parse().unwrap();
        let series_metadata = self
            .token_series_by_id
            .get(&token_series_id)
            .unwrap()
            .metadata;

        let mut token_metadata = self
            .tokens
            .token_metadata_by_id
            .as_ref()
            .unwrap()
            .get(&token_id)
            .unwrap();

        token_metadata.title = Some(format!(
            "{}{}{}",
            series_metadata.title.unwrap(),
            TITLE_DELIMETER,
            token_id_iter.next().unwrap()
        ));

        token_metadata.reference = series_metadata.reference;
        token_metadata.media = series_metadata.media;
        token_metadata.copies = series_metadata.copies;
        token_metadata.extra = series_metadata.extra;

        Some(Token {
            token_id,
            owner_id,
            metadata: Some(token_metadata),
            approved_account_ids,
        })
    }

    fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) {
        self.tokens
            .nft_transfer(receiver_id, token_id, approval_id, memo)
    }

    fn nft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<bool> {
        self.tokens
            .nft_transfer_call(receiver_id, token_id, approval_id, memo, msg)
    }
}

impl NonFungibleTokenResolver for Contract {
    fn nft_resolve_transfer(
        &mut self,
        previous_owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approved_account_ids: Option<std::collections::HashMap<AccountId, u64>>,
    ) -> bool {
        self.tokens.nft_resolve_transfer(
            previous_owner_id,
            receiver_id,
            token_id,
            approved_account_ids,
        )
    }
}

// Tests
#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use crate::payout::Payouts;

    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    const STORAGE_FOR_CREATE_SERIES: Balance = 8540000000000000000000;
    const STORAGE_FOR_MINT: Balance = 11280000000000000000000;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    fn setup_contract() -> (VMContextBuilder, Contract) {
        let mut context = VMContextBuilder::new();
        testing_env!(context.predecessor_account_id(accounts(0)).build());
        let mut contract = Contract::new_default_meta(accounts(0), accounts(4), true);

        testing_env!(context
            .predecessor_account_id(accounts(0))
            .attached_deposit(1)
            .build());

        contract.add_whitelisted_creator(accounts(1));

        (context, contract)
    }

    #[test]
    fn test_new() {
        let mut context = get_context(accounts(1));
        testing_env!(context.build());
        let contract = Contract::new(
            accounts(1),
            accounts(4),
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "Name".to_string(),
                symbol: "NM".to_string(),
                icon: Some(DATA_IMAGE_SVG_NFT_ICON.to_string()),
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
            500,
            true,
        );

        testing_env!(context.is_view(true).build());
        assert_eq!(
            contract.tokens.owner_id.to_string(),
            accounts(1).to_string()
        );
        assert_eq!(
            contract.nft_metadata().icon.unwrap(),
            DATA_IMAGE_SVG_NFT_ICON.to_string()
        );
    }

    fn create_series(
        contract: &mut Contract,
        royalty: &HashMap<AccountId, u32>,
        price: Option<U128>,
        copies: Option<u64>,
    ) {
        contract.nft_create_series(
            None,
            TokenMetadata {
                title: Some("title".to_string()),
                description: None,
                media: Some("media".to_string()),
                media_hash: None,
                copies: copies,
                issued_at: None,
                expires_at: None,
                starts_at: None,
                updated_at: None,
                extra: None,
                reference: Some("reference".to_string()),
                reference_hash: None,
            },
            price,
            Some(royalty.clone()),
            None,
            None,
        );
    }

    #[test]
    fn test_create_series() {
        let (mut context, mut contract) = setup_contract();

        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_CREATE_SERIES)
            .build());

        let mut royalty: HashMap<AccountId, u32> = HashMap::new();
        royalty.insert(accounts(1), 1000);
        create_series(
            &mut contract,
            &royalty,
            Some(U128::from(1 * 10u128.pow(24))),
            None,
        );

        let nft_series_return = contract.nft_get_series_single("1".to_string());
        assert_eq!(nft_series_return.creator_id, accounts(1));

        assert_eq!(nft_series_return.token_series_id, "1",);

        assert_eq!(nft_series_return.royalty, royalty,);

        assert!(nft_series_return.metadata.copies.is_none());

        assert_eq!(
            nft_series_return.metadata.title.unwrap(),
            "title".to_string()
        );

        assert_eq!(
            nft_series_return.metadata.reference.unwrap(),
            "reference".to_string()
        );
    }

    #[test]
    fn test_buy() {
        let (mut context, mut contract) = setup_contract();
        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_CREATE_SERIES)
            .build());

        let mut royalty: HashMap<AccountId, u32> = HashMap::new();
        royalty.insert(accounts(1), 1000);

        create_series(
            &mut contract,
            &royalty,
            Some(U128::from(1 * 10u128.pow(24))),
            None,
        );

        testing_env!(context
            .predecessor_account_id(accounts(2))
            .attached_deposit(1 * 10u128.pow(24) + STORAGE_FOR_MINT)
            .build());

        let token = contract.nft_buy("1".to_string());

        let token_from_nft_token = contract.nft_token(token.token_id);
        assert_eq!(token_from_nft_token.unwrap().owner_id, accounts(2));
    }

    #[test]
    fn test_mint() {
        let (mut context, mut contract) = setup_contract();
        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_CREATE_SERIES)
            .build());

        let mut royalty: HashMap<AccountId, u32> = HashMap::new();
        royalty.insert(accounts(1), 1000);

        create_series(&mut contract, &royalty, None, None);

        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_MINT)
            .build());

        let token = contract.nft_mint("1".to_string(), accounts(2));

        let token_from_nft_token = contract.nft_token(token.token_id);
        assert_eq!(token_from_nft_token.unwrap().owner_id, accounts(2))
    }

    #[test]
    fn test_nft_transfer() {
        let (mut context, mut contract) = setup_contract();
        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_CREATE_SERIES)
            .build());

        let mut royalty: HashMap<AccountId, u32> = HashMap::new();
        royalty.insert(accounts(1), 1000);

        create_series(&mut contract, &royalty, None, None);

        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_MINT)
            .build());

        let token = contract.nft_mint("1".to_string(), accounts(2));
        let token_id = &token.token_id;
        testing_env!(context
            .predecessor_account_id(accounts(2))
            .attached_deposit(1)
            .build());

        contract.nft_transfer(accounts(3), token_id.to_string(), None, None);

        let token = contract.nft_token(token_id.to_string()).unwrap();
        assert_eq!(token.owner_id, accounts(3))
    }

    #[test]
    fn test_nft_transfer_payout() {
        let (mut context, mut contract) = setup_contract();
        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_CREATE_SERIES)
            .build());

        let mut royalty: HashMap<AccountId, u32> = HashMap::new();
        royalty.insert(accounts(1), 1000);

        create_series(&mut contract, &royalty, None, None);

        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_MINT)
            .build());

        let token = contract.nft_mint("1".to_string(), accounts(2));
        let token_id = &token.token_id;

        testing_env!(context
            .predecessor_account_id(accounts(2))
            .attached_deposit(1)
            .build());

        let payout = contract.nft_transfer_payout(
            accounts(3),
            token_id.to_string(),
            Some(0),
            None,
            U128::from(1 * 10u128.pow(24)),
            Some(50),
        );

        let mut payout_calc: HashMap<AccountId, U128> = HashMap::new();
        payout_calc.insert(
            accounts(1),
            U128::from((1000 * (1 * 10u128.pow(24))) / 10_000),
        );
        payout_calc.insert(
            accounts(2),
            U128::from((9000 * (1 * 10u128.pow(24))) / 10_000),
        );

        assert_eq!(payout.payout, payout_calc);

        let token = contract.nft_token(token_id.to_string()).unwrap();
        assert_eq!(token.owner_id, accounts(3))
    }

    #[test]
    fn test_change_transaction_fee_immediately() {
        let (mut context, mut contract) = setup_contract();

        testing_env!(context
            .predecessor_account_id(accounts(0))
            .attached_deposit(1)
            .build());

        contract.set_transaction_fee(100, None);

        assert_eq!(contract.get_transaction_fee().current_fee, 100);
    }

    #[test]
    fn test_change_transaction_fee_with_time() {
        let (mut context, mut contract) = setup_contract();

        testing_env!(context
            .predecessor_account_id(accounts(0))
            .attached_deposit(1)
            .build());

        assert_eq!(contract.get_transaction_fee().current_fee, 500);
        assert_eq!(contract.get_transaction_fee().next_fee, None);
        assert_eq!(contract.get_transaction_fee().start_time, None);

        let next_fee: u16 = 100;
        let start_time: Timestamp = 1618109122863866400;
        let start_time_sec: TimestampSec = to_sec(start_time);
        contract.set_transaction_fee(next_fee, Some(start_time_sec));

        assert_eq!(contract.get_transaction_fee().current_fee, 500);
        assert_eq!(contract.get_transaction_fee().next_fee, Some(next_fee));
        assert_eq!(
            contract.get_transaction_fee().start_time,
            Some(start_time_sec)
        );

        testing_env!(context
            .predecessor_account_id(accounts(1))
            .block_timestamp(start_time + 1)
            .build());

        contract.calculate_current_transaction_fee();
        assert_eq!(contract.get_transaction_fee().current_fee, next_fee);
        assert_eq!(contract.get_transaction_fee().next_fee, None);
        assert_eq!(contract.get_transaction_fee().start_time, None);
    }

    #[test]
    fn test_transaction_fee_locked() {
        let (mut context, mut contract) = setup_contract();

        testing_env!(context
            .predecessor_account_id(accounts(0))
            .attached_deposit(1)
            .build());

        assert_eq!(contract.get_transaction_fee().current_fee, 500);
        assert_eq!(contract.get_transaction_fee().next_fee, None);
        assert_eq!(contract.get_transaction_fee().start_time, None);

        let next_fee: u16 = 100;
        let start_time: Timestamp = 1618109122863866400;
        let start_time_sec: TimestampSec = to_sec(start_time);
        contract.set_transaction_fee(next_fee, Some(start_time_sec));

        let mut royalty: HashMap<AccountId, u32> = HashMap::new();
        royalty.insert(accounts(1), 1000);

        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(STORAGE_FOR_CREATE_SERIES)
            .build());

        create_series(
            &mut contract,
            &royalty,
            Some(U128::from(1 * 10u128.pow(24))),
            None,
        );

        testing_env!(context
            .predecessor_account_id(accounts(1))
            .attached_deposit(1)
            .build());

        contract.nft_set_series_price("1".to_string(), None);

        assert_eq!(contract.get_transaction_fee().current_fee, 500);
        assert_eq!(contract.get_transaction_fee().next_fee, Some(next_fee));
        assert_eq!(
            contract.get_transaction_fee().start_time,
            Some(start_time_sec)
        );

        testing_env!(context
            .predecessor_account_id(accounts(2))
            .block_timestamp(start_time + 1)
            .attached_deposit(1)
            .build());

        contract.calculate_current_transaction_fee();
        assert_eq!(contract.get_transaction_fee().current_fee, next_fee);
        assert_eq!(contract.get_transaction_fee().next_fee, None);
        assert_eq!(contract.get_transaction_fee().start_time, None);

        let series = contract.nft_get_series_single("1".to_string());
        let series_transaction_fee: u128 = series.transaction_fee.unwrap().into();
        assert_eq!(series_transaction_fee, 500);
    }
}
