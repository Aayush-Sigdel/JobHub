import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const discoveries = [
  {
    title: "Find your remote rhythm",
    description: "Explore roles that let you work from where you feel your best.",
    action: "Explore remote jobs",
    href: "/home?tab=remote#job-feed",
    image: "/images/home/remote-work.png",
  },
  {
    title: "Good work starts together",
    description: "Meet collaborators and build something you can be proud of.",
    action: "Discover projects",
    href: "/collaborators/explore",
    image: "/images/home/collaboration.png",
  },
];

export function HomeDiscover({ onRemoteSelect }: { onRemoteSelect: () => void }) {
  return (
    <section aria-label="More ways to grow" className="mb-9 grid gap-4 md:grid-cols-2">
      {discoveries.map((discovery) => (
        <Link
          key={discovery.href}
          href={discovery.href}
          onClick={discovery.href.startsWith("/home") ? onRemoteSelect : undefined}
          className="group grid grid-cols-[minmax(0,1fr)_34%] overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-foreground/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none"
        >
          <div className="p-4 sm:p-5">
            <h2 className="text-sm font-semibold sm:text-base">{discovery.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {discovery.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold group-hover:underline underline-offset-4">
              {discovery.action}
              <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
            </span>
          </div>
          <div className="relative min-h-40 overflow-hidden bg-muted">
            <Image
              src={discovery.image}
              alt=""
              fill
              sizes="(max-width: 767px) 34vw, (max-width: 1279px) 17vw, 194px"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            />
          </div>
        </Link>
      ))}
    </section>
  );
}
