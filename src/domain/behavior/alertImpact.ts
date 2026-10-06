import type { AlertLevel } from "./alertMeter";

export const IMPACT_SHAKE_MS = 300;
export const IMPACT_FLASH_MS = 200;
export const IMPACT_MARK_MS = 800;
/** Time after which every part of the impact has finished. */
export const IMPACT_TOTAL_MS = Math.max(IMPACT_SHAKE_MS, IMPACT_FLASH_MS, IMPACT_MARK_MS);

/** The impact fires only on the update in which the level becomes "alert". */
export function shouldTriggerAlertImpact(previous: AlertLevel, current: AlertLevel): boolean {
  return current === "alert" && previous !== "alert";
}
