"use client";

import { useEffect } from "react";
import { GoCheckCircleFill } from "react-icons/go";
import { FeedbackForm } from "@/app/components/FeedbackForm";

const highlights = [
  "Share links you love with the community and discover new favorites.",
  "Vote on submissions to surface the most useful resources.",
  "Tag links so they are easy to find by topic or interest.",
  "Explore community data to learn what resonates most.",
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About • LinkPluck";
  }, []);

  return (
    <div className="flex flex-col gap-8 py-10">
      <section className="rounded-3xl border border-theme-border bg-theme-surface p-8 shadow-surface">
        <header className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold text-theme-text">What is LinkPluck?</h1>
          <p className="text-sm text-theme-subtle">
            LinkPluck is a community board for sharing standout websites. Submit your discoveries, vote on the ones
            you love, and explore curated collections built by everyone.
          </p>
        </header>

        <ul className="space-y-3 text-sm text-theme-text">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-2xl border border-theme-border/60 bg-theme-surfaceMuted px-4 py-3">
              <span className="mt-0.5 text-theme-primary">
                <GoCheckCircleFill />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 rounded-3xl border border-theme-border bg-theme-surface p-8 shadow-surface md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-theme-text">How it works</h2>
          <p className="text-sm text-theme-subtle">
            Add a link, choose the tags that describe it best, and press share. Each visitor can vote once per link, so
            quality content rises to the top. Curious about trends? The Data page surfaces community activity and tag
            insights.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-theme-text">Need help?</h2>
          <p className="text-sm text-theme-subtle">
            If you run into issues or have ideas for new features, drop us a quick note. Feedback notifications keep us
            on track as we evolve the experience.
          </p>
          <p className="text-sm text-theme-subtle">
            Experiencing token errors? Refresh the page and try again&mdash;your vote or submission will be ready to go.
          </p>
        </div>
      </section>

      <FeedbackForm />
    </div>
  );
}
