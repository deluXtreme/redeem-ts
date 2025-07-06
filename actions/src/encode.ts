import {
  toHex,
  encodeAbiParameters,
  parseAbiParameters,
  Hex,
  concatHex,
} from "viem";
import { FlowEdge, FlowMatrix, Stream } from "./circles";

const flowAbiType = {
  name: "flow",
  type: "tuple[]",
  components: [
    { name: "streamSinkId", type: "uint16" },
    { name: "amount", type: "uint192" },
  ],
} as const;

const encodeFlowEdges = (flowEdges: FlowEdge[]) =>
  encodeAbiParameters(
    [flowAbiType],
    [
      flowEdges.map((edge) => ({
        streamSinkId: edge.streamSinkId,
        amount: BigInt(edge.amount),
      })),
    ],
  );

const streamAbiType = [
  {
    name: "streams",
    type: "tuple[]",
    components: [
      { internalType: "uint16", name: "sourceCoordinate", type: "uint16" },
      { internalType: "uint16[]", name: "flowEdgeIds", type: "uint16[]" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
  },
] as const;

const encodeStreams = (streams: Stream[]) =>
  encodeAbiParameters(streamAbiType, [
    streams.map((stream) => ({
      ...stream,
      data: toHex(stream.data), // Convert Uint8Array to hex string
    })),
  ]);

export function encodeCallData(flowMatrix: FlowMatrix): Hex {
  const {
    flowVertices,
    flowEdges,
    streams,
    packedCoordinates,
    sourceCoordinate,
  } = flowMatrix;
  // This fucking shit doesn't work.
  // const abiParams = [
  //   parseAbiParameters("address[] flowVertices"),
  //   flowAbiType,
  //   streamAbiType,
  //   parseAbiParameters("bytes packedCoordinates"),
  //   parseAbiParameters("uint256 sourceCoordinate"),
  // ];
  // return encodeAbiParameters(abiParams, [
  //   flowVertices,
  //   flowEdges.map((edge) => ({
  //     streamSinkId: edge.streamSinkId,
  //     amount: BigInt(edge.amount),
  //   })),
  //   streams.map((stream) => ({
  //     ...stream,
  //     data: toHex(stream.data),
  //   })),
  //   packedCoordinates,
  //   sourceCoordinate,
  // ]);

  return concatHex([
    encodeAbiParameters(parseAbiParameters("address[] flowVertices"), [
      flowVertices,
    ]),
    encodeFlowEdges(flowEdges),
    encodeStreams(streams),
    encodeAbiParameters(parseAbiParameters("bytes packedCoordinates"), [
      packedCoordinates,
    ]),
    encodeAbiParameters(parseAbiParameters("uint256 sourceCoordinate"), [
      BigInt(sourceCoordinate),
    ]),
  ]);
}
