import { Secrets } from "@tenderly/actions/lib/actions";
import { redeemPayment } from "./redeem";
import { fetchRedeemableSubscriptions, getSecrets } from "./utils";

export async function runRedeemer(secrets: Secrets): Promise<void> {
  const { redeemer, apiUrl } = await getSecrets(secrets);
  const redeemable = await fetchRedeemableSubscriptions(apiUrl);
  console.log(`Found ${redeemable.length} redeemable subscriptions`);
  for (const subscription of redeemable) {
    try {
      await redeemPayment(redeemer, subscription);
    } catch (err) {
      console.error(`Failed to redeem ${subscription.id}:`, err);
    }
  }
}

// Docker entry point - constructs secrets from environment variables
export async function main(): Promise<void> {
  // Create a secrets object that reads from environment variables
  const secrets: Secrets = {
    get: async (key: string): Promise<string> => {
      const value = process.env[key];
      if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
      }
      return value;
    },
  };

  try {
    console.log("Starting redeemer process...");
    await runRedeemer(secrets);
    console.log("Redeemer process completed successfully");
  } catch (error) {
    console.error("Redeemer process failed:", error);
    process.exit(1);
  }
}
