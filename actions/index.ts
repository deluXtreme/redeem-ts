import { ActionFn, Context, Event } from "@tenderly/actions";
import { eventPipeline, runRedeemer } from "./src";

export const entryPoint: ActionFn = async (context: Context, event: Event) => {
  await eventPipeline(context, event);
};

export const blockWatchingRedeemer: ActionFn = async (
  context: Context,
  _: Event,
) => {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  await runRedeemer(context, currentTime);
};
