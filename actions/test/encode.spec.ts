// Unit test encodeCallData
import { encodeCallData, FlowMatrixAbi } from "../src/encode";
import { createFlowMatrix } from "../src/circles/flowMatrix";
import { Category } from "../src/types";
import { decodeAbiParameters, getAddress, Hex } from "viem";

describe("encodeCallData", () => {
  it("should encode the flow matrix correctly", async () => {
    const subscription = {
      id: "0x4652021487668a2c25747c81dc7d553d3c3121df19fac8c7f49e5adc478d1d31",
      subscriber: getAddress("0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214"),
      recipient: getAddress("0x6b69683c8897e3d18e74b1ba117b49f80423da5d"),
      amount: "220000000000000000",
      category: Category.Trusted,
      next_redeem_at: 0,
    };
    const {
      recipient: to,
      subscriber: from,
      amount: targetFlow,
    } = subscription;
    // const path = await findPath(CIRCLES_RPC, {
    //   from,
    //   to,
    //   targetFlow,
    //   useWrappedBalances: true,
    // });
    const path = {
      maxFlow: "220000000000000000",
      transfers: [
        {
          from: "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
          to: "0x6b69683c8897e3d18e74b1ba117b49f80423da5d",
          tokenOwner: "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
          value: "220000000000000000",
        },
      ],
    };
    const flowMatrix = createFlowMatrix(from, to, targetFlow, path.transfers);
    // const flowMatrix = {
    //   flowVertices: [
    //     "0x6B69683C8897e3d18e74B1Ba117b49f80423Da5d",
    //     "0xcF6Dc192dc292D5F2789DA2DB02D6dD4f41f4214",
    //   ],
    //   flowEdges: [
    //     {
    //       streamSinkId: 1,
    //       amount: 220000000000000000n,
    //     },
    //   ],
    //   streams: [
    //     {
    //       sourceCoordinate: 1,
    //       flowEdgeIds: [0],
    //       data: "0x",
    //     },
    //   ],
    //   packedCoordinates: "0x000100010000",
    //   sourceCoordinate: 1,
    // };
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

  it("example 2", async () => {
    const subscription = {
      id: "0x9c4412d30af600c6de7a2c746d92d63d30e67cac94946358f43422c2e08d067d",
      subscriber: getAddress("0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214"),
      recipient: getAddress("0x6b69683c8897e3d18e74b1ba117b49f80423da5d"),
      amount: "30000000000000000",
      category: Category.Trusted,
      next_redeem_at: 1752844015,
    };
    const {
      recipient: to,
      subscriber: from,
      amount: targetFlow,
    } = subscription;
    // const path = await findPath(CIRCLES_RPC, {
    //   from,
    //   to,
    //   targetFlow,
    //   useWrappedBalances: true,
    // });
    const path = {
      maxFlow: "30000000000000000",
      transfers: [
        {
          from: "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
          to: "0x6b69683c8897e3d18e74b1ba117b49f80423da5d",
          tokenOwner: "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
          value: "30000000000000000",
        },
      ],
    };
    const flowMatrix = createFlowMatrix(from, to, targetFlow, path.transfers);
    console.log(flowMatrix);
    const otherFlow = {
      flowVertices: [
        getAddress("0x6B69683C8897e3d18e74B1Ba117b49f80423Da5d"),
        getAddress("0xcF6Dc192dc292D5F2789DA2DB02D6dD4f41f4214"),
      ],
      flowEdges: [
        {
          streamSinkId: 1,
          amount: 30000000000000000n,
        },
      ],
      streams: [
        {
          sourceCoordinate: 1,
          flowEdgeIds: [0],
          data: "0x" as Hex,
        },
      ],
      packedCoordinates: "0x000100010000" as Hex,
      sourceCoordinate: 1,
    };
    // const flowMatrix = {
    //   flowVertices: [
    //     "0x6B69683C8897e3d18e74B1Ba117b49f80423Da5d",
    //     "0xcF6Dc192dc292D5F2789DA2DB02D6dD4f41f4214",
    //   ],
    //   flowEdges: [
    //     {
    //       streamSinkId: 1,
    //       amount: 220000000000000000n,
    //     },
    //   ],
    //   streams: [
    //     {
    //       sourceCoordinate: 1,
    //       flowEdgeIds: [0],
    //       data: "0x",
    //     },
    //   ],
    //   packedCoordinates: "0x000100010000",
    //   sourceCoordinate: 1,
    // };
    const encoded = encodeCallData(otherFlow);
    console.log("Bytes", encoded);
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
