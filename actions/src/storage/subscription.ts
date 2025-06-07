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

export class SubscriptionStorage {
  private KEY = "subscriptions";

  constructor(private store: Storage) {}

  async load(): Promise<SubscriptionMap> {
    const data: SubscriptionMap = (await this.store.getJson(this.KEY)) ?? {};
    return data;
  }

  async add(key: string, value: SubscriptionEvent): Promise<void> {
    const subscriptions = await this.load();
    subscriptions[key] = convertSubscriptionEvent(value);
    await this.store.putJson(key, subscriptions);
  }

  async remove(key: string) {
    const data = await this.load();
    if (key in data) {
      delete data[key];
      await this.store.putJson(this.KEY, data);
    }
  }

  async get(key: string) {
    const data = await this.load();
    if (key in data) {
      return data[key];
    }
    throw new Error(`Subscription ${key} not found`);
  }
}

function convertSubscriptionEvent(event: SubscriptionEvent): SubscriptionDoc {
  return {
    recipient: event.recipient,
    subscriber: event.subscriber,
    module: event.module,
    amount: event.amount.toString(),
    subId: event.subId.toString(),
  };
}
