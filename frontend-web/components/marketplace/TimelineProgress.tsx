import clsx from "clsx";
import { Check, Circle, X } from "lucide-react";

export interface TimelineStep {
  key: string;
  label: string;
  statuses: string[];
}

const bookingSteps: TimelineStep[] = [
  { key: "booking", label: "Booking", statuses: ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "accepted", label: "Accepted", statuses: ["accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "payment", label: "Payment", statuses: ["waiting_payment", "paid", "completed", "complaint"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
];

const detailSteps: TimelineStep[] = [
  { key: "booking", label: "Booking", statuses: ["pending", "accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "accepted", label: "Accepted", statuses: ["accepted", "on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "progress", label: "On Progress", statuses: ["on_the_way", "arrived_at_location", "in_progress", "waiting_payment", "paid", "completed", "complaint"] },
  { key: "payment", label: "Payment", statuses: ["waiting_payment", "paid", "completed", "complaint"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
];

const complaintSteps: TimelineStep[] = [
  { key: "created", label: "Complaint dibuat", statuses: ["pending", "process", "resolved", "rejected"] },
  { key: "process", label: "Diproses admin", statuses: ["process", "resolved"] },
  { key: "resolved", label: "Selesai", statuses: ["resolved"] },
];

export function TimelineProgress({
  status,
  variant = "booking",
  direction = "horizontal",
}: {
  status: string;
  variant?: "booking" | "detail" | "complaint";
  direction?: "horizontal" | "vertical";
}) {
  const steps = variant === "detail" ? detailSteps : variant === "complaint" ? complaintSteps : bookingSteps;
  const stopped = ["cancelled", "rejected"].includes(status);

  if (direction === "vertical") {
    return (
      <div className="space-y-0">
        {steps.map((step, index) => {
          const done = !stopped && step.statuses.includes(status);
          return (
            <div key={step.key} className="grid grid-cols-[32px_1fr] gap-3">
              <div className="flex flex-col items-center">
                <StepDot done={done} stopped={stopped} />
                {index < steps.length - 1 ? <div className={clsx("h-8 w-0.5", done ? "bg-brand-500" : "bg-line")} /> : null}
              </div>
              <div className="pb-5 text-sm font-semibold text-ink">{step.label}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {steps.map((step) => {
        const done = !stopped && step.statuses.includes(status);
        return (
          <div key={step.key} className="min-w-0 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full">
              <StepDot done={done} stopped={stopped} />
            </div>
            <div className="truncate text-[11px] font-semibold text-ink">{step.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function StepDot({ done, stopped }: { done: boolean; stopped: boolean }) {
  return (
    <span
      className={clsx(
        "grid h-8 w-8 place-items-center rounded-full border text-xs",
        done ? "border-brand-600 bg-brand-600 text-white" : stopped ? "border-red-200 bg-red-50 text-red-600" : "border-line bg-white text-muted",
      )}
    >
      {done ? <Check size={16} /> : stopped ? <X size={15} /> : <Circle size={13} />}
    </span>
  );
}
