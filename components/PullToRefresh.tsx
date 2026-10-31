"use client";
import { useEffect, useRef, useState } from "react";

export default function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const pullRef = useRef(0);

  useEffect(() => {
    const THRESHOLD = 66;
    const MAX_PULL = 110;

    const isAtTop = () =>
      (window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0) <= 2;

    const onStart = (y: number) => {
      if (refreshing || !isAtTop()) return;
      startYRef.current = y;
      pullRef.current = 0;
      pullingRef.current = true;
    };

    const onMove = (y: number, ev?: TouchEvent | null) => {
      if (!pullingRef.current || refreshing) return;
      const delta = y - startYRef.current;
      if (delta <= 0 || !isAtTop()) {
        if (pullRef.current > 0) {
          pullRef.current = 0;
          setPull(0);
        }
        return;
      }
      const nextPull = Math.min(MAX_PULL, Math.pow(delta, 0.82) * 1.55);
      if (nextPull > 8 && ev && ev.cancelable) ev.preventDefault();
      pullRef.current = nextPull;
      setDragging(true);
      setPull(nextPull);
    };

    const onEnd = () => {
      if (!pullingRef.current || refreshing) return;
      pullingRef.current = false;
      setDragging(false);
      if (pullRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPull(54);
        if (navigator.vibrate) navigator.vibrate(12);
        setTimeout(() => window.location.reload(), 350);
      } else {
        setPull(0);
      }
      pullRef.current = 0;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) onStart(e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) onMove(e.touches[0].clientY, e);
    };
    const handleMouseDown = (e: MouseEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName || "";
      if (e.button === 0 && !["INPUT", "BUTTON", "A", "SELECT", "TEXTAREA"].includes(tag)) {
        onStart(e.clientY);
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (pullingRef.current) onMove(e.clientY, null);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", onEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [refreshing]);

  const ready = pull >= 66;

  return (
    <div
      style={{
        position: "fixed",
        top: "env(safe-area-inset-top, 0px)",
        left: 0,
        right: 0,
        height: `${pull}px`,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        pointerEvents: "none",
        opacity: Math.min(1, pull / 55),
        transition: dragging ? "none" : "height 0.22s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.18s ease",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "999px",
          background: "rgba(15, 23, 42, 0.92)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          color: "#F8FAFC",
          fontSize: "12px",
          fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FACC15"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={refreshing ? "animate-spin" : ""}
          style={{
            transform: !refreshing && ready ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          {refreshing ? (
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          ) : (
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          )}
        </svg>
        <span>
          {refreshing
            ? "Actualisation..."
            : ready
            ? "Relâcher pour actualiser"
            : "Tirer pour actualiser"}
        </span>
      </div>
    </div>
  );
}
