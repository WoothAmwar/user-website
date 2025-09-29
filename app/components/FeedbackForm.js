"use client";

import { useState } from "react";

export function FeedbackForm({ className = "" }) {
  const [gaveFeedback, setGaveFeedback] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const feedback = formData.get("feedback");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback_content: feedback }),
      });

      if (!response.ok) {
        throw new Error("Unable to send feedback right now.");
      }

      setFeedbackContent(feedback);
      setGaveFeedback(true);
      event.currentTarget.reset();
    } catch (err) {
      setError(err.message || "Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className={`rounded-3xl border border-theme-border bg-theme-surface p-6 shadow-surface transition-colors ${className}`}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-theme-text">Share Feedback</h3>
          <p className="text-sm text-theme-subtle">
            Have ideas or suggestions? Let us know so we can make LinkPluck better.
          </p>
        </div>

        {gaveFeedback ? (
          <div className="rounded-2xl border border-theme-border bg-theme-surfaceMuted px-4 py-3 text-sm text-theme-text">
            Thanks for the feedback! We received: <strong>{feedbackContent}</strong>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-sm font-medium text-theme-subtle" htmlFor="feedback">
              Feedback for this website
            </label>
            <input
              className="w-full rounded-2xl border border-theme-border bg-theme-input px-4 py-3 text-sm placeholder:text-theme-subtle focus:border-theme-primary focus:outline-none focus:ring-0 focus:[box-shadow:0_0_0_2px_rgba(59,130,246,0.35)]"
              type="text"
              name="feedback"
              id="feedback"
              placeholder="Tell us how we can improve..."
              required
              disabled={isSubmitting}
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl bg-theme-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-primaryHover disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Submit Feedback"}
              </button>
              {error && <span className="text-sm text-theme-danger">{error}</span>}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
