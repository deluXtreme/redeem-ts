import { encodeAbiParameters, Hex, parseAbiParameters } from "viem";
import { FlowMatrix } from "./circles/flowMatrix";

export const FlowMatrixAbi = parseAbiParameters(
  "(address[] flowVertices, (uint16 streamSinkId, uint192 amount)[] flowEdges, (uint16 sourceCoordinate, uint16[] flowEdgeIds, bytes data)[] streams, bytes packedCoordinates, uint256 sourceCoordinate)",
);

export function encodeCallData({
  flowVertices,
  flowEdges,
  streams,
  packedCoordinates,
  sourceCoordinate,
}: FlowMatrix): Hex {
  return encodeAbiParameters(FlowMatrixAbi, [
    {
      flowVertices,
      flowEdges,
      streams,
      packedCoordinates,
      sourceCoordinate,
    },
  ]);
}
