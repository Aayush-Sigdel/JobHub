import { Suspense } from "react";
import LandingCompanies from "./landing-companies";
import { landing } from "./landing-styles";

export default function LandingSectionThree() {
  return (
    <section
      id="companies"
      className={landing.section + " scroll-mt-8 bg-background"}
    >
      <div className={landing.container}>
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Discover who’s hiring.
          </h2>
          <p className={landing.body + " mx-auto mt-4 max-w-xl"}>
            Explore companies with current opportunities on JobHub.
          </p>
        </div>
        <Suspense
          fallback={
            <div
              role="status"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[0, 1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-24 rounded-xl bg-muted motion-safe:animate-pulse"
                />
              ))}
              <span className="sr-only">Loading companies</span>
            </div>
          }
        >
          <LandingCompanies />
        </Suspense>
      </div>
    </section>
  );
}
