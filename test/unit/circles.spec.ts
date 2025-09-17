import { createFlowMatrix, TransferStep } from "../../src/circles/flowMatrix"; // adjust import path as needed
import { getAddress, parseEther, zeroAddress } from "viem";

describe("createFlowMatrix", () => {
  const sender = getAddress("0x6B69683C8897e3d18e74B1Ba117b49f80423Da5d");
  const receiver = getAddress("0xcF6Dc192dc292D5F2789DA2DB02D6dD4f41f4214");
  const sixThree = getAddress("0x6363636363636363636363636363636363636363");
  const ehFive = getAddress("0xa5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5a5");
  const sevenBee = getAddress("0x7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b7b");
  const effSeven = getAddress("0xf7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7f7");

  const value = parseEther("1");
  const valueStr = value.toString();

  const transfers: TransferStep[] = [
    {
      from: sender,
      to: sixThree,
      tokenOwner: sender,
      value: valueStr,
    },
    {
      from: ehFive,
      to: sixThree,
      tokenOwner: sevenBee,
      value: valueStr,
    },
    {
      from: sixThree,
      to: receiver,
      tokenOwner: effSeven,
      value: valueStr,
    },
  ];

  it("constructs a valid FlowMatrix", () => {
    const result = createFlowMatrix(sender, receiver, valueStr, transfers);
    expect(result).toEqual({
      flowVertices: [sixThree, sender, sevenBee, ehFive, receiver, effSeven],
      flowEdges: [
        { streamSinkId: 0, amount: value },
        { streamSinkId: 0, amount: value },
        { streamSinkId: 1, amount: value },
      ],
      streams: [
        {
          sourceCoordinate: 1,
          flowEdgeIds: [2],
          data: "0x",
        },
      ],
      packedCoordinates: "0x000100010000000200030000000500000004",
      sourceCoordinate: 1,
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
      createFlowMatrix(sender, receiver, valueStr, badTransfers),
    ).toThrow("Terminal sum");
  });
});
