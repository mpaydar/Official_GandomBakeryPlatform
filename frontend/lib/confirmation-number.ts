import { randomInt } from "crypto";

/** Human-readable pickup confirmation, e.g. GB-482910 */
export function generateConfirmationNumber(): string {
  return `GB-${randomInt(100000, 1_000_000)}`;
}
