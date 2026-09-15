"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getJobDetailAction } from "@/lib/actions/jobs";

/** List matches are profile-only; the detail endpoint supplies the displayed overall score. */
export function useJobProfileMatch(jobId: string) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  const query = useQuery({
    queryKey: ["job-profile-match", session?.user?.id, jobId],
    queryFn: () => getJobDetailAction(jobId),
    enabled: visible && Boolean(session?.user?.id),
    staleTime: 60_000,
    retry: false,
  });
  const value = query.data?.matchPercentage;
  return {
    elementRef: (element: HTMLElement | null) => { elementRef.current = element; },
    match: typeof value === "number" && Number.isFinite(value) ? Math.round(value) : null,
  };
}
