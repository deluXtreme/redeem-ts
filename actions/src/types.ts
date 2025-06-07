import { Address } from "viem";

export interface SubscriptionEvent {
  recipient: Address;
  subscriber: Address;
  module: Address;
  amount: bigint;
  subId: bigint;
  frequency: bigint;
}

export interface RedeemableSubscription {
  sub_id: string;
  module: string;
  subscriber: string;
  recipient: string;
  amount: string;
  next_redeem_at: number;
}
