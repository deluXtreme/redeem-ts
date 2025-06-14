import { Address } from "viem/_types";

export interface RedeemableSubscription {
  id: `0x${string}`;
  subscriber: Address;
  recipient: Address;
  amount: string;
  next_redeem_at: number;
  trusted: boolean;
}
