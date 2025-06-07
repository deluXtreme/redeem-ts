import { Storage } from "@tenderly/actions";
import { SubscriptionStorage } from "./subscription";
import { RedemptionStorage } from "./redemption";
export class AppStorage {
  public subscriptions: SubscriptionStorage;
  public redemptions: RedemptionStorage;

  constructor(store: Storage) {
    this.subscriptions = new SubscriptionStorage(store);
    this.redemptions = new RedemptionStorage(store);
  }
}
