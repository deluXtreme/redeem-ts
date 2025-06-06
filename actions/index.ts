import { ActionFn, Context, Event } from "@tenderly/actions";
import { newSubscriptionEvent, runRedeemer } from "./src";

export const entryPoint: ActionFn = async (context: Context, event: Event) => {
  console.log("Entry Point Triggered", event);
  await newSubscriptionEvent(context, event);
};

export const blockWatchingRedeemer: ActionFn = async (
  context: Context,
  _: Event,
) => {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  await runRedeemer(context, currentTime);
};
