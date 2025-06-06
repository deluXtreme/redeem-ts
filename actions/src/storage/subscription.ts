import { SubscriptionEvent } from "../types";
import { Storage } from "@tenderly/actions";
import { Address } from "viem";

type SubscriptionMap = Record<string, SubscriptionDoc>;

export interface SubscriptionDoc {
  recipient: Address;
  subscriber: Address;
  module: Address;
  amount: string;
  subId: string;
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

export async function addSubscription(
  store: Storage,
  subKey: string,
  doc: SubscriptionEvent,
): Promise<void> {
  const key = "subscriptions";
  const subscriptions: SubscriptionMap = (await store.getJson(key)) ?? {};

  subscriptions[subKey] = convertSubscriptionEvent(doc);

  await store.putJson(key, subscriptions);
}
export async function removeSubscription(
  store: Storage,
  subKey: string,
): Promise<void> {
  const key = "subscriptions";
  const subscriptions: SubscriptionMap = (await store.getJson(key)) ?? {};

  if (subKey in subscriptions) {
    delete subscriptions[subKey];
    await store.putJson(key, subscriptions);
  }
}

export async function getSubscription(
  store: Storage,
  subKey: string,
): Promise<SubscriptionDoc> {
  const key = "subscriptions";
  const subscriptions: SubscriptionMap = (await store.getJson(key)) ?? {};

  if (subKey in subscriptions) {
    return subscriptions[subKey];
  }
  throw new Error(`Subscription ${subKey} not found`);
}
