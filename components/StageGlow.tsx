import type { ReactNode } from "react";

type Tone = "sky" | "sun" | "dusk" | "meadow";
type Place = "end" | "start";

export default function StageGlow({
  children,
  className = "",
  tone = "sky",
  place = "end",
  drift = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  place?: Place;
  drift?: boolean;
}) {
  return (
    <div className={className ? `relative ${className}` : "relative"}>
      <div
        className={`gl-stage-glow${drift ? " is-drift" : ""}`}
        data-tone={tone}
        data-place={place}
        aria-hidden="true"
      >
        <span className="gl-stage-glow-a" />
        <span className="gl-stage-glow-b" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
