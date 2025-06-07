import { Address } from "viem";

export interface SubscriptionEvent {
  recipient: Address;
  subscriber: Address;
  module: Address;
  amount: bigint;
  subId: bigint;
  frequency: bigint;
}
