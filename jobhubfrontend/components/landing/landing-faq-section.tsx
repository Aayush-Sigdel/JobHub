"use client";

import { useId, useState } from "react";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { landing } from "./landing-styles";

const faqs = [
  {
    question: "What makes JobHub different?",
    answer:
      "JobHub brings job discovery, profiles, portfolios, and practical assessments together. Candidates can show their work, and employers can review more than a résumé when considering an application.",
  },
  {
    question: "Do I need to connect GitHub or a portfolio?",
    answer:
      "No. Start with your skills, experience, and education. You can add GitHub and portfolio links to give employers more context about the work you have done.",
  },
  {
    question: "How should I read a match score?",
    answer:
      "Treat it as a guide based on the information available. Review the job requirements and any supporting match evidence yourself. A score does not guarantee an interview or job offer.",
  },
  {
    question: "Does every job include an assessment?",
    answer:
      "No. Employers choose whether to attach programming, design, or SQL tasks to a listing. Check the job details to see what is required before you apply.",
  },
  {
    question: "Where can I track my applications?",
    answer:
      "Your job tracker keeps submitted applications and their current statuses together. Sign in and open Job Tracker to follow their progress.",
  },
  {
    question: "How do I review candidates as an employer?",
    answer:
      "Open a job in your hiring workspace to review applicants, profiles, and available assessment results. You can also edit the listing’s details from the same workspace.",
  },
];

export default function LandingSectionFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const id = useId();
  return (
    <section
      id="faq"
      className={landing.section + " scroll-mt-8 bg-background"}
    >
      <div className={landing.container}>
        <div className="mx-auto max-w-4xl">
          <h2 className={landing.heading + " mb-10 text-center"}>
            Frequently asked
            <br className="hidden sm:block" /> questions.
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const open = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={
                    "overflow-hidden rounded-2xl border bg-card transition-colors " +
                    (open ? "border-foreground/40" : "border-border")
                  }
                >
                  <h3>
                    <button
                      type="button"
                      id={id + "-question-" + index}
                      aria-expanded={open}
                      aria-controls={id + "-answer-" + index}
                      onClick={() => setOpenIndex(open ? null : index)}
                      className="flex w-full items-center justify-between gap-5 rounded-2xl p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-foreground sm:p-7"
                    >
                      <span className="text-base font-bold sm:text-lg">
                        {faq.question}
                      </span>
                      <span
                        className={
                          "flex size-9 shrink-0 items-center justify-center rounded-lg " +
                          (open
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground")
                        }
                      >
                        {open ? (
                          <IconMinus className="size-5" />
                        ) : (
                          <IconPlus className="size-5" />
                        )}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={id + "-answer-" + index}
                    role="region"
                    aria-labelledby={id + "-question-" + index}
                    hidden={!open}
                  >
                    <p className="px-6 pb-6 text-base leading-7 text-muted-foreground sm:px-7 sm:pb-7">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
