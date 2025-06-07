export interface RedeemableSubscription {
  sub_id: string;
  module: string;
  subscriber: string;
  recipient: string;
  amount: string;
  next_redeem_at: number;
}
