import { Context } from "@tenderly/actions";
import { redeemPayment } from "../redeem";
import { AppStorage } from "../storage";
import { getRedeemer} from "../utils";

export async function runRedeemer(
  context: Context,
  now: bigint,
): Promise<void> {
  const store = new AppStorage(context.storage);
  const [redemptions, redeemer] = await Promise.all([
    store.redemptions.getBefore(now),
    getRedeemer(context.secrets)
  ]);
  const failures = [];
  for (const [, subKeys] of Object.entries(redemptions)) {
    for (const subKey of subKeys) {
      try {
        const subscription = await store.subscriptions.get(subKey);
        const success = await redeemPayment(redeemer, subscription);
        if (!success) {
          failures.push(subKey);
        }
      } catch (err) {
        console.error(`Failed to redeem ${subKey}:`, err);
        failures.push(subKey);
      }
    }
  }
  // This assumes all redemptions were successful.
  await store.redemptions.removeBefore(now, failures);
}
