import { Address } from "viem";
import { ethers } from "ethers";

export type PathfindingResult = {
  maxFlow: string;
  transfers: TransferStep[];
};

export type TransferStep = {
  from: string;
  to: string;
  tokenOwner: string;
  value: string;
};

export interface FlowEdge {
  streamSinkId: number;
  amount: ethers.BigNumberish;
}

export interface Stream {
  sourceCoordinate: number;
  flowEdgeIds: number[];
  data: Uint8Array;
}

export interface FlowMatrix {
  flowVertices: string[]; // address[]
  flowEdges: FlowEdge[]; // tuple(uint16,uint192)[]
  streams: Stream[]; // tuple(uint16,uint16[],bytes)[]
  packedCoordinates: string; // hex bytes
  sourceCoordinate: number; // convenience, not part of ABI
}

/**
 * Pack a uint16 array into a hex string (big‑endian, no padding).
 */
export function packCoordinates(coords: number[]): string {
  const bytes = new Uint8Array(coords.length * 2);
  coords.forEach((c, i) => {
    const hi = c >> 8;
    const lo = c & 0xff;
    const offset = 2 * i;
    bytes[offset] = hi;
    bytes[offset + 1] = lo;
  });
  return ethers.hexlify(bytes);
}

/**
 * Build a sorted vertex list plus index lookup for quick coordinate mapping.
 */
export function transformToFlowVertices(
  transfers: TransferStep[],
  from: string,
  to: string,
): { sorted: string[]; idx: Record<string, number> } {
  const set = new Set<string>([from.toLowerCase(), to.toLowerCase()]);
  transfers.forEach((t) => {
    set.add(t.from.toLowerCase());
    set.add(t.to.toLowerCase());
    set.add(t.tokenOwner.toLowerCase());
  });

  const sorted = [...set].sort((a, b) => {
    const lhs = BigInt(a);
    const rhs = BigInt(b);
    const isLess = lhs < rhs;
    const isGreater = lhs > rhs;
    return isLess ? -1 : isGreater ? 1 : 0;
  });

  const idx: Record<string, number> = {};
  sorted.forEach((addr, i) => {
    idx[addr] = i;
  });

  return { sorted, idx };
}

/**
 * Create an ABI‑ready FlowMatrix object from a list of TransferSteps.
 */
export function createFlowMatrix(
  from: Address,
  to: Address,
  value: string,
  transfers: TransferStep[],
): FlowMatrix {
  const sender = from.toLowerCase();
  const receiver = to.toLowerCase();

  const { sorted: flowVertices, idx } = transformToFlowVertices(
    transfers,
    sender,
    receiver,
  );

  const flowEdges: FlowEdge[] = transfers.map((t) => {
    const isTerminal = t.to.toLowerCase() === receiver;
    return {
      streamSinkId: isTerminal ? 1 : 0,
      amount: BigInt(t.value), // keep as string – ethers will convert
    };
  });

  // Ensure at least one terminal edge
  const hasTerminalEdge = flowEdges.some((e) => e.streamSinkId === 1);
  if (!hasTerminalEdge) {
    const lastEdgeIndex = transfers
      .map((t) => t.to.toLowerCase())
      .lastIndexOf(receiver);
    const fallbackIndex =
      lastEdgeIndex === -1 ? flowEdges.length - 1 : lastEdgeIndex;
    flowEdges[fallbackIndex].streamSinkId = 1;
  }

  const termEdgeIds = flowEdges
    .map((e, i) => (e.streamSinkId === 1 ? i : -1))
    .filter((i) => i !== -1);

  const streams: Stream[] = [
    {
      sourceCoordinate: idx[sender],
      flowEdgeIds: termEdgeIds,
      data: new Uint8Array(0),
    },
  ];

  const coords: number[] = [];
  transfers.forEach((t) => {
    coords.push(idx[t.tokenOwner.toLowerCase()]);
    coords.push(idx[t.from.toLowerCase()]);
    coords.push(idx[t.to.toLowerCase()]);
  });

  const packedCoordinates = packCoordinates(coords);

  const expected = BigInt(value);
  const terminalSum = flowEdges
    .filter((e) => e.streamSinkId === 1)
    .reduce((sum, e) => sum + BigInt(e.amount.toString()), BigInt(0));

  const isBalanced = terminalSum === expected;
  if (!isBalanced) {
    throw new Error(
      `Terminal sum ${terminalSum} does not equal expected ${expected}`,
    );
  }

  return {
    flowVertices,
    flowEdges,
    streams,
    packedCoordinates,
    sourceCoordinate: idx[sender],
  };
}
