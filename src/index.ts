import { redeemPayment } from "./redeem";
import { fetchRedeemableSubscriptions } from "./utils";
import { loadConfig, Config } from "./config";

export async function runRedeemer(config: Config): Promise<void> {
  const redeemable = await fetchRedeemableSubscriptions(config.apiUrl);
  console.log(
    `Found ${redeemable.length} redeemable subscription(s): ${JSON.stringify(redeemable, null, 2)}`,
  );
  for (const subscription of redeemable) {
    try {
      await redeemPayment(config, subscription);
    } catch (err) {
      throw new Error(`Failed to redeem ${subscription.id}: ${err}`);
    }
  }
}

// Docker entry point - constructs secrets from environment variables
export async function main(): Promise<void> {
  try {
    console.log("Starting redeemer process...");
    const config = await loadConfig();
    await runRedeemer(config);
    console.log("Redeemer process completed");
  } catch (error) {
    console.error("Redeemer process failed:", error);
    process.exit(1);
  }
}
