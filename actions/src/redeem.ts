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
  "0xcEbE4B6d50Ce877A9689ce4516Fe96911e099A78",
);

const redeemAbi = parseAbi([
  "function redeem(bytes32 id, bytes calldata data)",
]);

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
    transport: http(),
    account: redeemer,
  }).extend(publicActions);
  console.log("Redeeming with", client.account.address);
  try {
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

      console.log("Found Path", path);
      const flowMatrix = createFlowMatrix(from, to, targetFlow, path.transfers);
      txHash = await client.writeContract({
        address: SUBSCRIPTION_MODULE,
        abi: redeemAbi,
        functionName: "redeem",
        args: [id, encodeCallData(flowMatrix)],
        account: redeemer,
      });
    }

    console.log(`Redeemed ${id} at:`, txHash);
    return true;
  } catch (err) {
    console.error(`Didn't work: ${err}`);
    return false;
  }
}
