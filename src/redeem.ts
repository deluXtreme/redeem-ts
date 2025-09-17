import { getAddress, Hex, parseAbi } from "viem";
import { Category, RedeemableSubscription, ConnectedWallet } from "./types";
import { encodeCallData } from "./encode";
import { getFlowMatrix } from "./utils";

const CIRCLES_RPC = "https://rpc.aboutcircles.com/";
const SUBSCRIPTION_MODULE = getAddress(
  "0xcEbE4B6d50Ce877A9689ce4516Fe96911e099A78",
);

const transactionData = {
  address: SUBSCRIPTION_MODULE,
  abi: parseAbi(["function redeem(bytes32 id, bytes calldata data)"]),
  functionName: "redeem",
} as const;

export async function redeemPayment(
  redeemer: ConnectedWallet,
  subscription: RedeemableSubscription,
): Promise<void> {
  const { id, category } = subscription;
  console.log("Redeeming with", redeemer.account.address);
  try {
    let calldata = "0x" as Hex;
    if (category === Category.Trusted) {
      const flowMatrix = await getFlowMatrix(CIRCLES_RPC, subscription);
      console.log("FlowMatrix", flowMatrix);
      calldata = encodeCallData(flowMatrix);
    }

    const txHash = await redeemer.writeContract({
      ...transactionData,
      args: [id, calldata],
    });
    console.log(`Redeemed ${id} at:`, txHash);
  } catch (err) {
    console.error(`Didn't work: ${err}`);
  }
}
