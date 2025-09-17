// Unit test encodeCallData
import { encodeCallData, FlowMatrixAbi } from "../../src/encode";
import { FlowMatrix } from "../../src/circles/flowMatrix";
import { decodeAbiParameters } from "viem";

describe("encodeCallData", () => {
  it("should encode the flow matrix correctly", async () => {
    const flowMatrix = {
      flowVertices: [
        "0x6B69683C8897e3d18e74B1Ba117b49f80423Da5d",
        "0xcF6Dc192dc292D5F2789DA2DB02D6dD4f41f4214",
      ],
      flowEdges: [
        {
          streamSinkId: 1,
          amount: 220000000000000000n,
        },
      ],
      streams: [
        {
          sourceCoordinate: 1,
          flowEdgeIds: [0],
          data: "0x",
        },
      ],
      packedCoordinates: "0x000100010000",
      sourceCoordinate: 1,
    } as FlowMatrix;
    const encoded = encodeCallData(flowMatrix);
    const [
      flowVertices,
      flowEdges,
      streams,
      packedCoordinates,
      sourceCoordinate,
    ] = decodeAbiParameters(FlowMatrixAbi, encoded);
    expect({
      flowVertices,
      flowEdges,
      streams,
      packedCoordinates,
      sourceCoordinate,
    }).toEqual(flowMatrix);
  });
});
