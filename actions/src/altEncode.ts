import { encodeAbiParameters, Hex, parseAbiParameters } from "viem";
import { FlowMatrix } from "./circles/flowMatrix";

export function encodeCallData({
  flowVertices,
  flowEdges,
  streams,
  packedCoordinates,
  sourceCoordinate,
}: FlowMatrix): Hex {  
  return encodeAbiParameters(
    parseAbiParameters(
      "(address[] flowVertices, (uint16 streamSinkId, uint192 amount)[] flowEdges, (uint16 sourceCoordinate, uint16[] flowEdgeIds, bytes data)[] streams, bytes packedCoordinates, uint256 sourceCoordinate)",
    ),
    [
      {
        flowVertices,
        flowEdges,
        streams,
        packedCoordinates,
        sourceCoordinate,
      },
    ],
  );
}
