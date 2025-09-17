import {
  type Address,
  Chain,
  HttpTransport,
  PrivateKeyAccount,
  WalletClient,
} from "viem";

export interface RedeemableSubscription {
  id: `0x${string}`;
  subscriber: Address;
  recipient: Address;
  amount: string;
  periods: number;
  next_redeem_at: number;
  category: Category;
}

export enum Category {
  Trusted = "trusted",
  Untrusted = "untrusted",
  Group = "group",
}

export type ConnectedWallet = WalletClient<
  HttpTransport,
  Chain,
  PrivateKeyAccount
>;

export interface Secrets {
  /**
   * Gets secret with key or throws if secret does not exist.
   */
  get(key: string): Promise<string>;
}
