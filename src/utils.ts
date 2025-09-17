import { Hex } from "viem";
import { RedeemableSubscription, Secrets } from "./types";
import { createFlowMatrix, findPath, FlowMatrix } from "./circles";

export async function getSecrets(
  secrets: Secrets,
): Promise<{ redeemerKey: `0x${string}`; apiUrl: URL }> {
  const [apiUrl, pk] = await Promise.all([
    secrets.get("API_URL"),
    secrets.get("REDEEMER_KEY"),
  ]);
  return {
    redeemerKey: pk.startsWith("0x") ? (pk as Hex) : `0x${pk}`,
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

export async function getFlowMatrix(
  rpcUrl: string,
  subscription: RedeemableSubscription,
): Promise<FlowMatrix> {
  const { recipient: to, subscriber: from, amount, periods } = subscription;
  const targetFlow = (BigInt(amount) * BigInt(periods)).toString();
  const path = await findPath(rpcUrl, {
    from,
    to,
    targetFlow,
    useWrappedBalances: false,
  });
  return createFlowMatrix(from, to, targetFlow, path.transfers);
}
