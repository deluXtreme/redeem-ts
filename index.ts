import { ActionFn, Context, Event } from "@tenderly/actions";
import { runRedeemer } from "./src";

export const blockWatchingRedeemer: ActionFn = async (
  context: Context,
  _: Event,
) => {
  await runRedeemer(context.secrets);
};
