import type { Address, Hex } from "viem";
import { createWalletClient, getAddress, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gnosis } from "viem/chains";
import { ConnectedWallet, Secrets } from "./types";

export interface Config {
  apiUrl: URL;
  redeemer: ConnectedWallet;
  circlesRpc: string;
  subscriptionModule: Address;
}

// Default values
export const DEFAULT_CIRCLES_RPC = "https://rpc.aboutcircles.com/";
export const DEFAULT_SUBSCRIPTION_MODULE =
  "0xcEbE4B6d50Ce877A9689ce4516Fe96911e099A78";

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

async function getSecrets(
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

/**
 * Loads configuration:
 * - API_URL, REDEEMER_KEY via provided Secrets
 * - CIRCLES_RPC, SUBSCRIPTION_MODULE via env or defaults from constants
 */
export async function loadConfig(): Promise<Config> {
  const { apiUrl, redeemerKey } = await getSecrets(secrets);
  const redeemer = createWalletClient({
    account: privateKeyToAccount(redeemerKey),
    chain: gnosis,
    transport: http(),
  }).extend(publicActions);

  const circlesRpc = process.env.CIRCLES_RPC ?? DEFAULT_CIRCLES_RPC;

  const subscriptionModule = getAddress(
    process.env.SUBSCRIPTION_MODULE ?? DEFAULT_SUBSCRIPTION_MODULE,
  );

  return {
    apiUrl,
    redeemer,
    circlesRpc,
    subscriptionModule,
  };
}
