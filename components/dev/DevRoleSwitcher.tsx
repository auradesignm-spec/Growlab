"use client";

import { useRef } from "react";
import { setDevViewer } from "@/lib/dev/actions";

export interface DevUserOption {
  id: string;
  name: string;
  role: string;
  label: string;
}

export default function DevRoleSwitcher({
  users,
  currentUserId,
}: {
  users: DevUserOption[];
  currentUserId: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="border-b border-white/10 bg-night px-5 py-2 sm:px-8">
      <form
        ref={formRef}
        action={setDevViewer}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="font-west text-[10px] uppercase tracking-[0.28em] text-frost-dim">
          Dev: viewing as —
        </span>
        <select
          name="userId"
          defaultValue={currentUserId ?? undefined}
          onChange={() => formRef.current?.requestSubmit()}
          className="border border-white/15 bg-night px-2 py-1 font-mono text-[11px] text-frost focus-visible:outline-none focus-visible:border-signal"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.label}
            </option>
          ))}
        </select>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost-faint">
          not real auth — dev stand-in
        </span>
      </form>
    </div>
  );
}
