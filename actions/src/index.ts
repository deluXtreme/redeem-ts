import {
  ActionFn,
  Context,
  Event,
  Secrets,
  TransactionEvent,
} from "@tenderly/actions";
import { subscriptionManagerAbi } from "./abi";
import {
  Address,
  createPublicClient,
  decodeEventLog,
  Hex,
  http,
  PrivateKeyAccount,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { redeemPayment } from "./redeem";
import {
  appendRedemption,
  getValidRedemptions,
  removeRedemptionsBefore,
} from "./storage";
import {
  addSubscription,
  getSubscription,
  removeSubscription,
} from "./storage/subscription";
import { CIRCLES_RPC } from "./constants";

function subscriptionKey(subId: bigint, module: Address): string {
  return `${subId}-${module}`;
}

async function getRedeemer(secrets: Secrets): Promise<PrivateKeyAccount> {
  const redeemerKey = (await secrets.get("REDEEMER_KEY")) as Hex;
  return privateKeyToAccount(redeemerKey);
}

export const newSubscriptionEvent: ActionFn = async (
  context: Context,
  event: Event,
) => {
  const store = context.storage;
  const tx = event as TransactionEvent;
  const subscriptionEvents = tx.logs
    .map((log, _) => {
      try {
        return decodeEventLog({
          abi: subscriptionManagerAbi,
          data: log.data as `0x${string}`,
          topics: log.topics as [`0x${string}`],
        });
      } catch (err) {
        return null;
      }
    })
    .filter(
      (decoded): decoded is NonNullable<typeof decoded> => decoded !== null,
    );
  const redeemer = await getRedeemer(context.secrets);
  for (const { eventName, args } of subscriptionEvents) {
    // These fields exist on all events!
    const subKey = subscriptionKey(args!.subId, args!.module);
    console.log(`Processing ${eventName} Event with key`, subKey);
    if (eventName === "SubscriptionCreated") {
      // New subscriptions are immediately redeemable!
      const event = args!;
      await addSubscription(store, subKey, event);
      const txHash = await redeemPayment(redeemer, { ...event });
      console.log("Redeemed at", txHash);
    } else if (eventName === "SubscriptionCancelled") {
      await removeSubscription(store, subKey);
    } else if (eventName === "Redeemed") {
      await appendRedemption(store, subKey, args!.nextRedeemAt);
    }
  }
};

export async function runRedeemer(
  context: Context,
  now: bigint,
): Promise<void> {
  const store = context.storage;
  const redemptions = await getValidRedemptions(store, now);
  const redeemer = await getRedeemer(context.secrets);
  const failures = [];
  for (const [, subKeys] of Object.entries(redemptions)) {
    for (const subKey of subKeys) {
      try {
        const subscription = await getSubscription(context.storage, subKey);
        const success = await redeemPayment(redeemer, subscription);
        if (!success) {
          failures.push(subKey);
        }
      } catch (err) {
        console.error(`Failed to redeem ${subKey}:`, err);
      }
    }
  }
  // This assumes all redemptions were successful.
  await removeRedemptionsBefore(store, now, failures);
}
