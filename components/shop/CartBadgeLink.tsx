"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CART_ADDED_EVENT } from "@/lib/shop/cartMotion";

export default function CartBadgeLink({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count: number;
}) {
  const [pop, setPop] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    let timer = 0;
    const play = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      setPop(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setPop(false), 420);
    };
    const onAdd = () => play();
    window.addEventListener(CART_ADDED_EVENT, onAdd);
    return () => {
      window.removeEventListener(CART_ADDED_EVENT, onAdd);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (count > prev.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPop(true);
      const id = window.setTimeout(() => setPop(false), 420);
      prev.current = count;
      return () => window.clearTimeout(id);
    }
    prev.current = count;
  }, [count]);

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-[14px] text-frost-dim transition-colors duration-150 ease-out hover:text-frost"
    >
      <span>{label}</span>
      {count > 0 ? (
        <span className={`gl-cart-count${pop ? " is-pop" : ""}`}>{count}</span>
      ) : null}
    </Link>
  );
}
