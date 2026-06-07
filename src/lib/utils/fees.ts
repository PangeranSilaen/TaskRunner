import { PLATFORM_FEE_RATE } from "@/lib/constants";

export interface FeeBreakdown {
  /** Fee the runner receives. */
  runnerFee: number;
  /** Platform commission (10%). */
  platformFee: number;
  /** Total the customer pays. */
  totalFee: number;
  /** What the runner actually takes home (== runnerFee). */
  runnerEarning: number;
}

/**
 * Compute the fee breakdown from a chosen runner fee.
 *
 *   platform_fee   = runner_fee * 10%
 *   total_fee      = runner_fee + platform_fee
 *   runner_earning = runner_fee
 */
export function calculateFees(runnerFee: number): FeeBreakdown {
  const platformFee = Math.round(runnerFee * PLATFORM_FEE_RATE);
  return {
    runnerFee,
    platformFee,
    totalFee: runnerFee + platformFee,
    runnerEarning: runnerFee,
  };
}
