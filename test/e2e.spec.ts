// Unit test encodeCallData
import { encodeCallData, FlowMatrixAbi } from "../src/encode";
import { getFlowMatrix } from "../src/utils";
import { decodeAbiParameters } from "viem";
import { RedeemableSubscription } from "../src/types";

describe.skip("RPC Based Tests", () => {
  it("e2e: test on subscription", async () => {
    const sampleData = {
      id: "0x9bafd7444ba424830038c3357cd0df67361781a317e5d12315e6a07d9ebd03d2",
      subscriber: "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
      recipient: "0x6b69683c8897e3d18e74b1ba117b49f80423da5d",
      amount: "10000000000000000",
      periods: 157,
      category: "trusted",
      next_redeem_at: 1757540225,
    } as RedeemableSubscription;

    const flowMatrix = await getFlowMatrix(
      "https://rpc.aboutcircles.com/",
      sampleData,
    );
    console.log("Flow Matrix", flowMatrix);

    const encoded = encodeCallData(flowMatrix);
    
    console.log("Encoded", encoded);
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
