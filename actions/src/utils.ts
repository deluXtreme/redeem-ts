import { Secrets } from "@tenderly/actions/lib/actions";
import { Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RedeemableSubscription } from "./types";

export async function getRedeemer(
  secrets: Secrets,
): Promise<PrivateKeyAccount> {
  const redeemerKey = (await secrets.get("REDEEMER_KEY")) as Hex;
  return privateKeyToAccount(redeemerKey);
}

export async function fetchRedeemableSubscriptions(): Promise<
  RedeemableSubscription[]
> {
  try {
    const response = await fetch("https://subindexer-api.fly.dev/redeemable");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as RedeemableSubscription[];
  } catch (error) {
    console.error("Failed to fetch redeemable subscriptions:", error);
    throw error;
  }
}
