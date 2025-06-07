import { Log, Secrets } from "@tenderly/actions/lib/actions";
import { Address, decodeEventLog, Hex, PrivateKeyAccount } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { subscriptionManagerAbi } from "./abi";

export function subscriptionKey(subId: bigint, module: Address): string {
  return `${subId}-${module}`;
}

export async function getRedeemer(
  secrets: Secrets,
): Promise<PrivateKeyAccount> {
  const redeemerKey = (await secrets.get("REDEEMER_KEY")) as Hex;
  return privateKeyToAccount(redeemerKey);
}

export function decodeSubscriptionEvents(logs: Log[]) {
  const relevantEvents = logs
    .map((log, _) => {
      try {
        return decodeEventLog({
          abi: subscriptionManagerAbi,
          data: log.data as `0x${string}`,
          topics: log.topics as [`0x${string}`],
        });
      } catch (err) {
        return null;
      }
    })
    .filter(
      (decoded): decoded is NonNullable<typeof decoded> => decoded !== null,
    );
  return relevantEvents;
}
