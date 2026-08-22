"use client";

import { useEffect, useState } from "react";

export type ProblemKind = "relay" | "swap" | "vanity" | "stake";

export interface ProblemLabels {
  you: string;
  manager: string;
  team: string;
  days: string;
  causeYou: string;
  causeManager: string;
  causeTeam: string;
  relayAria: string;
  hint: string;
  wait: string;
  sold: string;
  run: string;
  reach: string;
  sales: string;
  fee: string;
  win: string;
  fail: string;
}

export default function ProblemFigure({
  kind,
  labels,
}: {
  kind: ProblemKind;
  labels: ProblemLabels;
}) {
  if (kind === "relay") return <RelayFigure labels={labels} />;
  if (kind === "swap") return <SwapFigure labels={labels} />;
  if (kind === "vanity") return <VanityFigure labels={labels} />;
  return <StakeFigure labels={labels} />;
}

function RelayFigure({ labels }: { labels: ProblemLabels }) {
  const [step, setStep] = useState(0);
  const [locked, setLocked] = useState(false);
  const nodes = [
    { role: labels.you, cause: labels.causeYou, mark: "1" },
    { role: labels.manager, cause: labels.causeManager, mark: "2" },
    { role: labels.team, cause: labels.causeTeam, mark: "3" },
  ];
  const active = nodes[step];

  useEffect(() => {
    if (locked) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % 3);
    }, 1800);
    return () => window.clearInterval(id);
  }, [locked]);

  function pick(index: number) {
    setLocked(true);
    setStep(index);
  }

  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <div className="flex justify-end">
        <span className="rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[11px] text-frost">
          {labels.days}
        </span>
      </div>

      <div className="relative mt-5">
        <span className="pointer-events-none absolute inset-x-[16%] top-[21px] h-px bg-line" aria-hidden="true" />

        <div className="relative grid grid-cols-3" role="group" aria-label={labels.relayAria}>
          {nodes.map((node, index) => (
            <div key={node.mark} className="flex justify-center">
              <button
                type="button"
                aria-pressed={step === index}
                aria-label={`${node.role}. ${node.cause}`}
                onClick={() => pick(index)}
                className={`relative z-[1] flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-full font-mono text-[13px] font-semibold transition-colors duration-150 ease-out ${
                  step === index
                    ? "bg-frost text-white"
                    : "border border-line bg-white text-frost-dim hover:bg-night"
                }`}
              >
                {node.mark}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {nodes.map((node, index) => (
          <p
            key={node.mark}
            className={`text-[12px] font-medium transition-colors duration-150 ease-out ${
              step === index ? "text-frost" : "text-frost-faint"
            }`}
          >
            {node.role}
          </p>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-white px-4 py-3 text-center">
        <p className="text-[12px] font-semibold text-frost">{active.role}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-frost-dim">{active.cause}</p>
      </div>
      <p className="mt-2 text-center text-[11px] text-frost-faint">{labels.hint}</p>
    </div>
  );
}

function SwapFigure({ labels }: { labels: ProblemLabels }) {
  return (
    <div className="gl-prob-swap relative mx-auto h-[88px] w-full max-w-[220px]" aria-hidden="true">
      <div className="gl-prob-swap-a absolute inset-y-0 flex w-[46%] items-center justify-center rounded-2xl border border-line bg-white">
        <span className="text-[12px] font-medium text-frost">{labels.sold}</span>
      </div>
      <div className="gl-prob-swap-b absolute inset-y-0 flex w-[46%] items-center justify-center rounded-2xl border border-line bg-white">
        <span className="text-[12px] font-medium text-frost">{labels.run}</span>
      </div>
    </div>
  );
}

function VanityFigure({ labels }: { labels: ProblemLabels }) {
  return (
    <div className="mx-auto flex h-[88px] w-full max-w-[220px] flex-col justify-center gap-3" aria-hidden="true">
      <div>
        <div className="mb-1 flex justify-between text-[11px] text-frost-dim">
          <span>{labels.reach}</span>
          <span className="font-mono">84k</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-night">
          <span className="gl-prob-reach block h-full rounded-full bg-frost" />
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-[11px] text-frost-dim">
          <span>{labels.sales}</span>
          <span className="font-mono">0</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-night">
          <span className="block h-full w-[6%] rounded-full bg-line" />
        </div>
      </div>
    </div>
  );
}

function StakeFigure({ labels }: { labels: ProblemLabels }) {
  return (
    <div className="mx-auto grid h-[88px] w-full max-w-[220px] grid-cols-2 gap-2" aria-hidden="true">
      <div className="flex flex-col justify-between rounded-2xl border border-line bg-white px-3 py-2">
        <span className="text-[11px] font-medium text-frost">{labels.win}</span>
        <span className="gl-prob-fee font-mono text-[13px] text-frost">2,000</span>
        <span className="text-[11px] text-frost-faint">{labels.fee}</span>
      </div>
      <div className="flex flex-col justify-between rounded-2xl border border-line bg-white px-3 py-2">
        <span className="text-[11px] font-medium text-frost">{labels.fail}</span>
        <span className="gl-prob-fee font-mono text-[13px] text-frost">2,000</span>
        <span className="text-[11px] text-frost-faint">{labels.fee}</span>
      </div>
    </div>
  );
}
