// Unit test encodeCallData
import { encodeCallData, FlowMatrixAbi } from "../src/encode";
import { FlowMatrix } from "../src/circles/flowMatrix";
import { getFlowMatrix } from "../src/utils";
import { decodeAbiParameters } from "viem";
import { RedeemableSubscription } from "../src/types";

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

  it.skip("e2e: test on subscription", async () => {
    const sampleData = {
      id: "0x9c4412d30af600c6de7a2c746d92d63d30e67cac94946358f43422c2e08d067d",
      subscriber: "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
      recipient: "0x6b69683c8897e3d18e74b1ba117b49f80423da5d",
      amount: "10000000000000000",
      periods: 47,
      category: "trusted",
      next_redeem_at: 1752862015,
    } as RedeemableSubscription;
    const flowMatrix = await getFlowMatrix(
      "https://rpc.aboutcircles.com/",
      sampleData,
    );
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

  it("e2e: test on subscription", async () => {
    const sampleData = {
    "id": "0x9bafd7444ba424830038c3357cd0df67361781a317e5d12315e6a07d9ebd03d2",
    "subscriber": "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
    "recipient": "0x6b69683c8897e3d18e74b1ba117b49f80423da5d",
    "amount": "10000000000000000",
    "periods": 157,
    "category": "trusted",
    "next_redeem_at": 1757540225
  } as RedeemableSubscription;
    const flowMatrix = await getFlowMatrix(
      "https://rpc.aboutcircles.com/",
      sampleData,
    );
    console.log("Flow Matrix", flowMatrix);
    const encoded = encodeCallData(flowMatrix);
    console.log("Encoded", encoded)
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
