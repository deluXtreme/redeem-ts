import { createFlowMatrix, findPath } from "./circles";
import {
  toHex,
  getAddress,
  createWalletClient,
  http,
  publicActions,
  PrivateKeyAccount,
} from "viem";
import { gnosis } from "viem/chains";
import { RedeemableSubscription } from "./types";

const CIRCLES_RPC = "https://rpc.aboutcircles.com/";
const SUBSCRIPTION_MANAGER = getAddress(
  "0x7E9BaF7CC7cD83bACeFB9B2D5c5124C0F9c30834",
);

const redeemAbi = [
  {
    inputs: [
      { internalType: "address", name: "module", type: "address" },
      { internalType: "uint256", name: "subId", type: "uint256" },
      { internalType: "address[]", name: "flowVertices", type: "address[]" },
      {
        components: [
          { internalType: "uint16", name: "streamSinkId", type: "uint16" },
          { internalType: "uint192", name: "amount", type: "uint192" },
        ],
        internalType: "struct TypeDefinitions.FlowEdge[]",
        name: "flow",
        type: "tuple[]",
      },
      {
        components: [
          { internalType: "uint16", name: "sourceCoordinate", type: "uint16" },
          { internalType: "uint16[]", name: "flowEdgeIds", type: "uint16[]" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        internalType: "struct TypeDefinitions.Stream[]",
        name: "streams",
        type: "tuple[]",
      },
      { internalType: "bytes", name: "packedCoordinates", type: "bytes" },
    ],
    name: "redeemPayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export async function redeemPayment(
  redeemer: PrivateKeyAccount,
  subscription: RedeemableSubscription,
): Promise<boolean> {
  console.log("Redeeming", subscription);
  const {
    recipient: to,
    subscriber: from,
    amount: targetFlow,
    module,
    sub_id,
  } = subscription;
  const path = await findPath(CIRCLES_RPC, {
    from: getAddress(from),
    to: getAddress(to),
    targetFlow,
    useWrappedBalances: true,
  });

  const { flowVertices, flowEdges, streams, packedCoordinates } =
    createFlowMatrix(
      getAddress(from),
      getAddress(to),
      targetFlow,
      path.transfers,
    );

  const client = createWalletClient({
    chain: gnosis,
    transport: http(CIRCLES_RPC),
    account: redeemer,
  }).extend(publicActions);

  const txHash = await client.writeContract({
    address: SUBSCRIPTION_MANAGER,
    abi: redeemAbi,
    functionName: "redeemPayment",
    args: [
      getAddress(module),
      BigInt(sub_id),
      flowVertices as `0x${string}`[],
      // Transform ethers to viem:
      flowEdges.map((e) => ({ ...e, amount: BigInt(e.amount.toString()) })),
      streams.map((s) => ({ ...s, data: toHex(s.data) })),
      packedCoordinates as `0x${string}`,
    ],
  });
  console.log(`Redeemed at:`, txHash);
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  return receipt.status === "success";
}
