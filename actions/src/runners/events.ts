import { ActionFn, Context, Event, TransactionEvent } from "@tenderly/actions";
import { redeemPayment } from "../redeem";
import { AppStorage } from "../storage";
import { decodeSubscriptionEvents, getRedeemer, subscriptionKey } from "../utils";

export const eventPipeline: ActionFn = async (
  context: Context,
  event: Event,
) => {
  const store = new AppStorage(context.storage);
  const subscriptionEvents = decodeSubscriptionEvents((event as TransactionEvent).logs);

  for (const { eventName, args } of subscriptionEvents) {
    // These fields exist on all events!
    const subKey = subscriptionKey(args!.subId, args!.module);
    console.log(`Processing ${eventName} Event with key`, subKey);
    if (eventName === "SubscriptionCreated") {
      // New subscriptions are immediately redeemable!
      const event = args!;
      await store.subscriptions.add(subKey, event);
      const redeemer = await getRedeemer(context.secrets);
      await redeemPayment(redeemer, { ...event });
    } else if (eventName === "SubscriptionCancelled") {
      await store.subscriptions.remove(subKey);
    } else if (eventName === "Redeemed") {
      await store.redemptions.append(subKey, args!.nextRedeemAt);
    }
  }
};