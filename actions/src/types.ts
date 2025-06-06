import { Address } from "viem";

export interface SubscriptionDoc {
  recipient: Address;
  subscriber: Address;
  module: Address;
  amount: string;
  subId: string;
}

export interface SubscriptionEvent {
  recipient: Address;
  subscriber: Address;
  module: Address;
  amount: bigint;
  subId: bigint;
  frequency: bigint;
}

export function convertSubscriptionEvent(
  event: SubscriptionEvent,
): SubscriptionDoc {
  return {
    recipient: event.recipient,
    subscriber: event.subscriber,
    module: event.module,
    amount: event.amount.toString(),
    subId: event.subId.toString(),
  };
}
