"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep the design assessment's 400 × 300 canvas and scale only its display. */
export function DesignCanvasFrame({ children }: { children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = frame.current;
    const content = canvas.current;
    if (!element || !content) return;
    const resize = () => {
      content.style.transform = `scale(${element.clientWidth / 400})`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className="relative mx-auto aspect-[4/3] w-full max-w-[400px] overflow-hidden bg-white ring-1 ring-border">
      <div ref={canvas} className="absolute left-0 top-0 h-[300px] w-[400px] origin-top-left">
        {children}
      </div>
    </div>
  );
}
