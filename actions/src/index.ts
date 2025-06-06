import {
  ActionFn,
  Context,
  Event,
  Secrets,
  TransactionEvent,
} from "@tenderly/actions";
import { subscriptionManagerAbi } from "./abi";
import { Address, decodeEventLog, Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { redeemPayment } from "./redeem";
import { convertSubscriptionEvent, SubscriptionDoc } from "./types";
import {
  appendRedemption,
  getValidRedemptions,
  removeRedemptionsBefore,
} from "./storage";

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
        // console.error(`Error decoding log ${index}:`, log, err);
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
    console.log(`Processing ${eventName} Event with args`, args);
    if (eventName === "SubscriptionCreated") {
      // New subscriptions are immediately redeemable!
      const event = convertSubscriptionEvent(args!);
      const txHash = await redeemPayment(redeemer, { ...event });
      console.log("Redeemed first payment at", txHash);
      await context.storage.putJson(subKey, { ...event });
    } else if (eventName === "SubscriptionCancelled") {
      await context.storage.delete(subKey);
    } else if (eventName === "Redeemed") {
      await appendRedemption(context.storage, subKey, args!.nextRedeemAt);
    }
  }
};

export async function runRedeemer(
  context: Context,
  now: bigint,
): Promise<void> {
  const redemptions = await getValidRedemptions(context.storage, now);
  const redeemer = await getRedeemer(context.secrets);
  for (const [, subKeys] of Object.entries(redemptions)) {
    for (const subKey of subKeys) {
      try {
        const subscription: SubscriptionDoc =
          await context.storage.getJson(subKey);
        const txHash = await redeemPayment(redeemer, subscription);
        console.log(`Redeemed Payment for ${subKey} at:`, txHash);
      } catch (err) {
        console.error(`Failed to redeem for key ${subKey}:`, err);
      }
    }
  }
  await removeRedemptionsBefore(context.storage, now);
}
