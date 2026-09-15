import Image from "next/image";
import { cn } from "@/lib/utils";

export default function JobHubLogo({
  className,
  markClassName,
  markOnly = false,
}: {
  className?: string;
  markClassName?: string;
  markOnly?: boolean;
}) {
  return (
    <span
      role="img"
      aria-label="JobHub"
      className={cn(
        "inline-flex shrink-0 select-none items-center gap-2.5 text-foreground",
        className,
      )}
    >
      <Image
        src="/brand/jobhub-mark.svg"
        width={48}
        height={48}
        alt=""
        aria-hidden="true"
        className={cn("size-8 shrink-0", markClassName)}
      />
      {!markOnly && (
        <span
          aria-hidden="true"
          className="text-xl font-semibold tracking-[-0.045em] leading-none"
        >
          JobHub
        </span>
      )}
    </span>
  );
}
