import { Storage } from "@tenderly/actions";

export interface RedemptionMap {
  [time: string]: string[]; // using string since object keys can't be bigint
}

const REDEMPTION_KEY = "redemptions";

export class RedemptionStorage {
  private REDEMPTION_KEY = "redemptions";

  constructor(private store: Storage) {}

  async load(): Promise<RedemptionMap> {
    // Load stored map (or initialize)
    return (await this.store.getJson(this.REDEMPTION_KEY)) ?? {};
  }

  async save(record: RedemptionMap): Promise<void> {
    // Save back to storage
    this.store.putJson(this.REDEMPTION_KEY, record);
  }

  async append(subKey: string, time: bigint): Promise<void> {
    const redemptions = await this.load();

    const timeKey = time.toString(); // convert bigint to string

    if (redemptions[timeKey]) {
      // Add to existing list (if not already present)
      if (!redemptions[timeKey].includes(subKey)) {
        redemptions[timeKey].push(subKey);
      } else {
        return;
      }
    } else {
      // New redemption time
      redemptions[timeKey] = [subKey];
    }

    this.save(redemptions);
  }

  async removeSingle(subKey: string): Promise<void> {
    const redemptions = await this.load();
    let updated = false;

    for (const [timeKey, keys] of Object.entries(redemptions)) {
      if (keys.includes(subKey)) {
        const filtered = keys.filter((key) => key !== subKey);
        if (filtered.length === 0) {
          delete redemptions[timeKey];
        } else {
          redemptions[timeKey] = filtered;
        }
        updated = true;
        break; // assuming each subKey appears at most once
      }
    }

    if (updated) {
      this.save(redemptions);
    }
  }

  async removeBefore(cutoffTime: bigint, keepers: string[]): Promise<void> {
    const redemptions = await this.load();

    for (const timeKey of Object.keys(redemptions)) {
      const redemptionTime = BigInt(timeKey);
      if (redemptionTime < cutoffTime) {
        delete redemptions[timeKey];
      }
    }
    // Add back the keepers to time Zero.
    redemptions["0"] = keepers;
    this.save(redemptions);
  }

  async getBefore(time: bigint): Promise<RedemptionMap> {
    const redemptions = await this.load();

    const valid: RedemptionMap = {};

    for (const [timeKey, subKeys] of Object.entries(redemptions)) {
      const redemptionTime = BigInt(timeKey);
      if (redemptionTime < time) {
        valid[timeKey] = subKeys;
      }
    }

    return valid;
  }
}

export async function appendRedemption(
  store: Storage,
  subKey: string,
  redeemTime: bigint,
): Promise<void> {
  // Load stored map (or initialize)
  const redemptions: RedemptionMap =
    (await store.getJson(REDEMPTION_KEY)) ?? {};

  const timeKey = redeemTime.toString(); // convert bigint to string

  if (redemptions[timeKey]) {
    // Add to existing list (if not already present)
    if (!redemptions[timeKey].includes(subKey)) {
      redemptions[timeKey].push(subKey);
    }
  } else {
    // New redemption time
    redemptions[timeKey] = [subKey];
  }

  // Save back to storage
  await store.putJson(REDEMPTION_KEY, redemptions);
}

export async function removeRedemptionByKey(
  store: Storage,
  subKey: string,
): Promise<void> {
  const redemptions: RedemptionMap =
    (await store.getJson(REDEMPTION_KEY)) ?? {};
  let updated = false;

  for (const [timeKey, keys] of Object.entries(redemptions)) {
    if (keys.includes(subKey)) {
      const filtered = keys.filter((key) => key !== subKey);
      if (filtered.length === 0) {
        delete redemptions[timeKey];
      } else {
        redemptions[timeKey] = filtered;
      }
      updated = true;
      break; // assuming each subKey appears at most once
    }
  }

  if (updated) {
    await store.putJson(REDEMPTION_KEY, redemptions);
  }
}

export async function removeRedemptionsBefore(
  store: Storage,
  cutoffTime: bigint,
  keepers: string[],
): Promise<void> {
  const key = "redemptions";
  const redemptions: RedemptionMap = (await store.getJson(key)) ?? {};

  for (const timeKey of Object.keys(redemptions)) {
    const redemptionTime = BigInt(timeKey);
    if (redemptionTime < cutoffTime) {
      delete redemptions[timeKey];
    }
  }
  // Add back the keepers to time Zero.
  redemptions["0"] = keepers;
  await store.putJson(key, redemptions);
}

export async function getValidRedemptions(
  store: Storage,
  time: bigint,
): Promise<RedemptionMap> {
  const redemptions: RedemptionMap =
    (await store.getJson(REDEMPTION_KEY)) ?? {};

  const valid: RedemptionMap = {};

  for (const [timeKey, subKeys] of Object.entries(redemptions)) {
    const redemptionTime = BigInt(timeKey);
    if (redemptionTime < time) {
      valid[timeKey] = subKeys;
    }
  }

  return valid;
}
