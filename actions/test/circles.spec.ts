import { createFlowMatrix, TransferStep } from "../src/circles/flowMatrix"; // adjust import path as needed
import { describe, it, expect } from "@jest/globals";
import { parseEther } from "viem";

describe("createFlowMatrix", () => {
  const sender = "0x52";
  const receiver = "0xcf";
  const value = parseEther("1").toString();

  const transfers: TransferStep[] = [
    {
      from: sender,
      to: "0xa5",
      tokenOwner: sender,
      value,
    },
    {
      from: "0xa5",
      to: "0x63",
      tokenOwner: "0x7b",
      value,
    },
    {
      from: "0x63",
      to: receiver,
      tokenOwner: "0xf7",
      value,
    },
  ];

  it.only("constructs a valid FlowMatrix", () => {
    const result = createFlowMatrix(sender, receiver, value, transfers);
    expect(result).toEqual({
      flowVertices: [sender, "0x63", "0x7b", "0xa5", receiver, "0xf7"],
      flowEdges: [
        { streamSinkId: 0, amount: value },
        { streamSinkId: 0, amount: value },
        { streamSinkId: 1, amount: value },
      ],
      streams: [
        {
          sourceCoordinate: 0,
          flowEdgeIds: [2],
          data: new Uint8Array(0),
        },
      ],
      packedCoordinates: "0x000000000003000200030001000500010004",
      sourceCoordinate: 0,
    });
  });

  it("throws if terminal sum does not match expected", () => {
    const badTransfers: TransferStep[] = [
      {
        from: sender,
        to: receiver,
        tokenOwner: sender,
        value: parseEther("0.1").toString(), // mismatch on purpose
      },
    ];

    expect(() =>
      createFlowMatrix(sender, receiver, value, badTransfers),
    ).toThrow("Terminal sum");
  });
});

// describe("findPath", () => {
//     const sender = "0x52e14be00d5acff4424ad625662c6262b4fd1a58";
//     const receiver = "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214";
//     const value = ethers.parseEther("1").toString();

//     it("throws if terminal sum does not match expected", async () => {
//         const path = await findPath(CIRCLES_RPC, {
//             from: sender,
//             to: receiver,
//             targetFlow: value,
//             useWrappedBalances: true,
//         });
//         console.log(path);
//     });
//   });
