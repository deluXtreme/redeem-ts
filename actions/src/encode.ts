import { encodeAbiParameters, Hex, parseAbiParameters } from "viem";
import { FlowMatrix } from "./circles/flowMatrix";

export const FlowMatrixAbi = parseAbiParameters(
  "address[] flowVertices, (uint16 streamSinkId, uint192 amount)[] flowEdges, (uint16 sourceCoordinate, uint16[] flowEdgeIds, bytes data)[] streams, bytes packedCoordinates, uint16 sourceCoordinate",
);

export function encodeCallData(args: FlowMatrix): Hex {
  const {
    flowVertices,
    flowEdges,
    streams,
    packedCoordinates,
    sourceCoordinate,
  } = args;
  return encodeAbiParameters(FlowMatrixAbi, [
    // @ts-ignore
    flowVertices,
    flowEdges,
    streams,
    packedCoordinates,
    sourceCoordinate,
  ]);
}
