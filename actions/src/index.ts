import { ActionFn, Context, Event, TransactionEvent } from "@tenderly/actions";
import { subscriptionManagerAbi } from "./abi";
import { decodeEventLog } from "viem";
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
    console.log(subscriptionEvents);

};