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
const SUBSCRIPTION_MANAGER = getAddress("PUT_NEW_ADDRESS");

const redeemAbi = [
  {
    inputs: [
      { internalType: "bytes32", name: "id", type: "bytes32" },
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
    name: "redeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    type: "function",
    name: "redeemUntrusted",
    inputs: [
      {
        name: "id",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export async function redeemPayment(
  redeemer: PrivateKeyAccount,
  subscription: RedeemableSubscription,
): Promise<boolean> {
  const {
    recipient: to,
    subscriber: from,
    amount: targetFlow,
    id,
    trusted,
  } = subscription;
  const client = createWalletClient({
    chain: gnosis,
    transport: http(CIRCLES_RPC),
    account: redeemer,
  }).extend(publicActions);
  let txHash;
  if (!trusted) {
    txHash = await client.writeContract({
      abi: redeemAbi,
      functionName: "redeemUntrusted",
      address: SUBSCRIPTION_MANAGER,
      args: [id],
    });
  } else {
    const path = await findPath(CIRCLES_RPC, {
      from,
      to,
      targetFlow,
      useWrappedBalances: true,
    });

    const { flowVertices, flowEdges, streams, packedCoordinates } =
      createFlowMatrix(from, to, targetFlow, path.transfers);

    txHash = await client.writeContract({
      address: SUBSCRIPTION_MANAGER,
      abi: redeemAbi,
      functionName: "redeem",
      args: [
        id,
        flowVertices,
        // Transform ethers to viem:
        flowEdges.map((e) => ({ ...e, amount: BigInt(e.amount.toString()) })),
        streams.map((s) => ({ ...s, data: toHex(s.data) })),
        packedCoordinates as `0x${string}`,
      ],
    });
  }

  console.log(`Redeemed ${id} at:`, txHash);
  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  return receipt.status === "success";
}
