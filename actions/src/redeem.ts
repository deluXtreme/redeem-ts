import { createFlowMatrix, findPath } from "./circles";
import {
  getAddress,
  createWalletClient,
  http,
  publicActions,
  PrivateKeyAccount,
  parseAbi,
} from "viem";
import { gnosis } from "viem/chains";
import { Category, RedeemableSubscription } from "./types";
import { encodeCallData } from "./encode";

const CIRCLES_RPC = "https://rpc.aboutcircles.com/";
const SUBSCRIPTION_MODULE = getAddress(
  "0x48BC28f8757cF5dc38eE7219DFf1c1F2b768737D",
);

const redeemAbi = parseAbi(["function redeem(bytes32 id, bytes data)"]);

export async function redeemPayment(
  redeemer: PrivateKeyAccount,
  subscription: RedeemableSubscription,
): Promise<boolean> {
  const {
    recipient: to,
    subscriber: from,
    amount: targetFlow,
    id,
    category,
  } = subscription;
  const client = createWalletClient({
    chain: gnosis,
    transport: http(CIRCLES_RPC),
    account: redeemer,
  }).extend(publicActions);
  let txHash;
  if (category !== Category.Trusted) {
    txHash = await client.writeContract({
      abi: redeemAbi,
      functionName: "redeem",
      address: SUBSCRIPTION_MODULE,
      args: [id, "0x"],
    });
  } else {
    const path = await findPath(CIRCLES_RPC, {
      from,
      to,
      targetFlow,
      useWrappedBalances: true,
    });

    const flowMatrix = createFlowMatrix(from, to, targetFlow, path.transfers);
    txHash = await client.writeContract({
      address: SUBSCRIPTION_MODULE,
      abi: redeemAbi,
      functionName: "redeem",
      args: [id, encodeCallData(flowMatrix)],
    });
  }

  console.log(`Redeemed ${id} at:`, txHash);
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  return receipt.status === "success";
}
