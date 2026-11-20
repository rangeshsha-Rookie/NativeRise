import { Check, Clock, AlertCircle } from "lucide-react";

export function Stepper({
  steps = [],
  className = "",
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={`flex flex-col gap-0 relative py-2 ${className}`}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isDone = step.state === "done";
        const isCurrent = step.state === "current";
        const isFailed = step.state === "failed";

        return (
          <div key={step.key || idx} className="flex gap-4 relative">
            {/* Dot & Connecting Line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors z-10 ${
                  isDone
                    ? "bg-nr-success text-white"
                    : isCurrent
                    ? "bg-nr-primary text-nr-ink ring-4 ring-nr-primary-soft"
                    : isFailed
                    ? "bg-nr-danger text-white"
                    : "bg-nr-cream-2 text-nr-ink-2 border border-nr-line"
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isFailed ? (
                  <AlertCircle className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[36px] my-1 ${
                    isDone ? "bg-nr-success" : "bg-nr-line"
                  }`}
                />
              )}
            </div>

            {/* Label and Content */}
            <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-semibold ${
                    isCurrent
                      ? "text-nr-ink font-bold"
                      : isDone
                      ? "text-nr-ink"
                      : isFailed
                      ? "text-nr-danger"
                      : "text-nr-ink-2"
                  }`}
                >
                  {step.title || step.label}
                </span>
                {step.at && (
                  <span className="text-xs text-nr-ink-2">
                    {step.at}
                  </span>
                )}
              </div>

              {(step.subtitle || step.description) && (
                <p className="text-xs text-nr-ink-2 mt-0.5">
                  {step.subtitle || step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
