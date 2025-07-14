import { Secrets } from "@tenderly/actions/lib/actions";
import { Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RedeemableSubscription } from "./types";

export async function getSecrets(
  secrets: Secrets,
): Promise<{ redeemer: PrivateKeyAccount; apiUrl: URL }> {
  const [apiUrl, pk] = await Promise.all([
    secrets.get("API_URL"),
    secrets.get("REDEEMER_KEY"),
  ]);
  return {
    redeemer: privateKeyToAccount(
      pk.startsWith("0x") ? (pk as Hex) : `0x${pk}`,
    ),
    apiUrl: new URL(apiUrl),
  };
}

export async function fetchRedeemableSubscriptions(
  apiUrl: URL,
): Promise<RedeemableSubscription[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds
  try {
    const response = await fetch(apiUrl, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as RedeemableSubscription[];
  } catch (error) {
    console.error("Failed to fetch redeemable subscriptions:", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
