import { Secrets } from "@tenderly/actions/lib/actions";
import { redeemPayment } from "./redeem";
import { fetchRedeemableSubscriptions, getRedeemer } from "./utils";

export async function runRedeemer(secrets: Secrets): Promise<void> {
  const [redeemable, redeemer] = await Promise.all([
    fetchRedeemableSubscriptions(),
    getRedeemer(secrets),
  ]);
  console.log(`Found ${redeemable.length} redeemable subscriptions`);
  for (const subscription of redeemable) {
    try {
      await redeemPayment(redeemer, subscription);
    } catch (err) {
      console.error(`Failed to redeem ${subscription.sub_id}:`, err);
    }
  }
}
