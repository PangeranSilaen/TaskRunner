import { formatRupiah } from "@/lib/utils/cn";
import { calculateFees } from "@/lib/utils/fees";

/**
 * Show the fee breakdown. `variant`:
 * - "customer": Biaya runner / Komisi platform / Total dibayar
 * - "runner":   Fee task / Komisi platform / Kamu terima
 */
export function FeeBreakdown({
  runnerFee,
  variant = "customer",
}: {
  runnerFee: number;
  variant?: "customer" | "runner";
}) {
  const fees = calculateFees(runnerFee);

  return (
    <div className="flex flex-col gap-2 rounded-card bg-primary-soft/50 p-4 text-sm">
      <Row label="Biaya runner" value={formatRupiah(fees.runnerFee)} />
      <Row
        label="Komisi platform (10%)"
        value={formatRupiah(fees.platformFee)}
      />
      <div className="my-1 border-t border-primary/10" />
      {variant === "customer" ? (
        <Row
          label="Total dibayar"
          value={formatRupiah(fees.totalFee)}
          strong
        />
      ) : (
        <Row
          label="Kamu terima"
          value={formatRupiah(fees.runnerEarning)}
          strong
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold text-ink" : "text-ink-soft"}>
        {label}
      </span>
      <span
        className={strong ? "font-bold text-primary-dark" : "font-medium text-ink"}
      >
        {value}
      </span>
    </div>
  );
}
