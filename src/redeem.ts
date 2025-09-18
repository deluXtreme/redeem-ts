import { Hex, parseAbi } from "viem";
import { Category, RedeemableSubscription } from "./types";
import { encodeCallData } from "./encode";
import { getFlowMatrix } from "./utils";
import { Config } from "./config";

export async function redeemPayment(
  { subscriptionModule, circlesRpc, redeemer }: Config,
  subscription: RedeemableSubscription,
): Promise<void> {
  const { id, category } = subscription;
  console.log("Redeeming with", redeemer.account.address);

  try {
    let calldata = "0x" as Hex;
    if (category === Category.Trusted) {
      const flowMatrix = await getFlowMatrix(circlesRpc, subscription);
      console.log("FlowMatrix", flowMatrix);
      calldata = encodeCallData(flowMatrix);
    }

    const txHash = await redeemer.writeContract({
      address: subscriptionModule,
      abi: parseAbi(["function redeem(bytes32 id, bytes calldata data)"]),
      functionName: "redeem",
      args: [id, calldata],
    });
    console.log(`Redeemed ${id} at:`, txHash);
  } catch (err) {
    console.error(`Didn't work: ${err}`);
  }
}
