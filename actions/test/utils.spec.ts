import { fetchRedeemableSubscriptions } from "../src/utils";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock the global fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("fetchRedeemableSubscriptions", () => {
  const mockResponse = [
    {
      sub_id: "4",
      module: "0xeb522ba17a582b8df500bf107d13b1099eaa091c",
      subscriber: "0xcf6dc192dc292d5f2789da2db02d6dd4f41f4214",
      recipient: "0xa65d69e34da7ffcb45804aa437b1f4c9fedeaef7",
      amount: "10000000000000000",
      next_redeem_at: 0,
    },
    {
      sub_id: "12",
      module: "0x39c90767e9fe8f10c3a83b003657ebba7068bbab",
      subscriber: "0x6b69683c8897e3d18e74b1ba117b49f80423da5d",
      recipient: "0xede0c2e70e8e2d54609c1bdf79595506b6f623fe",
      amount: "1000000000000",
      next_redeem_at: 1749315225,
    },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should successfully fetch and parse redeemable subscriptions", async () => {
    // Mock successful response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchRedeemableSubscriptions();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://subindexer-api.fly.dev/redeemable",
    );
    expect(result).toEqual(mockResponse);
    expect(result).toHaveLength(2);
    expect(result[0].sub_id).toBe("4");
    expect(result[1].sub_id).toBe("12");
  });

  it("should throw an error when the response is not ok", async () => {
    // Mock failed response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(fetchRedeemableSubscriptions()).rejects.toThrow(
      "HTTP error! status: 404",
    );
  });

  it("should throw an error when the fetch fails", async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchRedeemableSubscriptions()).rejects.toThrow(
      "Network error",
    );
  });

  it("should handle empty response array", async () => {
    // Mock empty response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    const result = await fetchRedeemableSubscriptions();
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
