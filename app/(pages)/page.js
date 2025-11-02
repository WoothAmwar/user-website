"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoCheck, GoCheckCircleFill, GoChevronDown, GoLink, GoPlus, GoX, GoXCircleFill } from "react-icons/go";
import { FeedbackForm } from "@/app/components/FeedbackForm";

const websiteCategories = [
  "Personal Website",
  "Entertainment",
  "Mainstream",
  "Technology",
  "Education",
  "Sports",
];

function AddWebsiteCard() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [urlValue, setUrlValue] = useState("");

  function toggleTag(tag) {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      return prev.concat(tag);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setStatusType("success");

    const trimmedUrl = urlValue.trim();

    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedUrl,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to share that link right now.");
      }

      const data = await response.json();
      if (data && data.data && data.data.valid === 1) {
        setStatusType("success");
        setStatusMessage("Thanks! Your link was shared with the community.");
        setUrlValue("");
        setSelectedTags([]);
      } else {
        setStatusType("error");
        setStatusMessage("That link could not be added. Please try again.");
      }
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message || "Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-theme-border bg-theme-surface p-6 shadow-surface">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-theme-subtle">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-theme-border bg-theme-input text-lg text-theme-text">
              <GoPlus />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-theme-text">Share a Link</h2>
              <p className="text-sm text-theme-subtle">Paste a URL and add optional tags so others can discover it.</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-theme-border bg-theme-input px-4 py-3">
              <input
                className="w-full bg-transparent text-sm text-theme-text placeholder:text-theme-subtle focus:outline-none"
                type="text"
                name="name"
                placeholder="Paste a URL to share..."
                value={urlValue}
                onChange={(event) => setUrlValue(event.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-theme-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-primaryHover disabled:opacity-60"
            >
              {isSubmitting ? "Sharing..." : "Share"}
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-theme-subtle">Add tags (optional)</p>
            <div className="flex flex-wrap gap-2">
              {websiteCategories.map((category) => {
                const isActive = selectedTags.includes(category);
                const baseClasses = "cursor-pointer rounded-full border border-theme-border px-4 py-2 text-xs font-semibold transition-colors";
                const activeClasses = "bg-theme-primary text-white";
                const inactiveClasses = "bg-theme-muted text-theme-tagText hover:border-theme-primary";
                const badgeClasses = [
                  baseClasses,
                  isActive ? activeClasses : inactiveClasses,
                ].join(" ");

                return (
                  <label key={category} className={badgeClasses}>
                    <input
                      type="checkbox"
                      name="categories"
                      value={category}
                      checked={isActive}
                      onChange={() => toggleTag(category)}
                      className="sr-only"
                    />
                    {category}
                  </label>
                );
              })}
            </div>
          </div>

          {statusMessage && (
            <div
              className={[
                "rounded-2xl px-4 py-3 text-sm",
                statusType === "success"
                  ? "border border-theme-border bg-theme-surfaceMuted text-theme-text"
                  : "border border-theme-danger/40 bg-theme-surfaceMuted text-theme-danger",
              ].join(" ")}
            >
              {statusMessage}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function DisplaySingleWebsite({ websiteInfo, index, onVoteError }) {
  const [websiteUpvotes, setWebsiteUpvotes] = useState(0);
  const [websiteDownvotes, setWebsiteDownvotes] = useState(0);
  const [votedUp, setVotedUp] = useState(false);
  const [votedDown, setVotedDown] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [websiteUserTags, setUserTags] = useState([]);
  const lastFetchedSlug = useRef("");

  useEffect(() => {
    setWebsiteUpvotes(websiteInfo.website_upvotes);
    setWebsiteDownvotes(websiteInfo.website_remove_votes);
    if (websiteInfo.website_name && websiteInfo.website_name.indexOf("https") !== -1) {
      setWebsiteUrl(websiteInfo.website_name);
    } else {
      setWebsiteUrl("https://" + websiteInfo.website_name);
    }
  }, [websiteInfo]);

  useEffect(() => {
    const slug = websiteInfo.website_name || "";
    if (!slug || lastFetchedSlug.current === slug) {
      return;
    }

    lastFetchedSlug.current = slug;

    async function getWebsiteTags() {
      try {
        const encodedName = encodeURIComponent(slug.split("/").join("|||"));
        const response = await fetch("/api/tags/" + encodedName, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Tags unavailable");
        }

        const data = await response.json();
        if (data && data.data && data.data[0] && data.data[0].tags) {
          setUserTags(prev => [...prev, ...data.data[0].tags]);
        }
      } catch (error) {
        console.warn("Error getting user tags for website:", error);
      }
    }

    getWebsiteTags();

  }, [websiteInfo.website_name]);

  async function buttonVoteChange(voteType) {
    if (
      isVoting ||
      (votedUp && voteType === "upvote") ||
      (votedDown && voteType === "downvote")
    ) {
      return;
    }

    setIsVoting(true);

    try {
      const response = await fetch("/api/voting/" + voteType, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_upvotes: websiteUpvotes,
          current_downvotes: websiteDownvotes,
          website_name: websiteInfo.website_name,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Vote failed - You probably already voted for that website");
      }

      if (voteType === "upvote") {
        setVotedUp(true);
        setWebsiteUpvotes(function (prev) {
          return prev + 1;
        });
      } else {
        setVotedDown(true);
        setWebsiteDownvotes(function (prev) {
          return prev + 1;
        });
      }
    } catch (error) {
      if (voteType === "upvote") {
        setVotedUp(false);
        setWebsiteUpvotes(websiteInfo.website_upvotes);
      } else {
        setVotedDown(false);
        setWebsiteDownvotes(websiteInfo.website_remove_votes);
      }

      onVoteError(error.message);
    } finally {
      setIsVoting(false);
    }
  }

  const upvoteButtonClasses = [
    "flex h-10 w-10 items-center justify-center rounded-full border border-theme-border transition-colors",
    votedUp ? "bg-theme-primary text-white" : "text-theme-subtle hover:text-theme-text",
    isVoting ? "opacity-60" : "",
  ].join(" ");

  const downvoteButtonClasses = [
    "flex h-10 w-10 items-center justify-center rounded-full border border-theme-border transition-colors",
    votedDown ? "text-theme-danger" : "text-theme-subtle hover:text-theme-text",
    isVoting ? "opacity-60" : "",
  ].join(" ");

  return (
    <article className="rounded-2xl border border-theme-border bg-theme-surfaceMuted px-4 py-4 transition-colors hover:border-theme-primary/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:flex-1">
          <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-theme-border bg-theme-surface text-sm font-semibold text-theme-subtle">
            {"#" + (index + 1)}
          </span>

          <div className="min-w-0 flex-1">
            <a
              className="flex items-center gap-2 text-sm font-semibold text-theme-text hover:text-theme-primary"
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="text-lg text-theme-primary">
                <GoLink />
              </span>
              <span className="truncate">{websiteUrl}</span>
            </a>
            {websiteUserTags && websiteUserTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {websiteUserTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-theme-muted px-3 py-1 text-xs font-medium text-theme-tagText"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <span className="rounded-full border border-theme-border bg-theme-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-theme-subtle">
            {websiteUpvotes + " votes"}
          </span>
          <button
            className={upvoteButtonClasses}
            onClick={() => buttonVoteChange("upvote")}
            disabled={isVoting || votedUp}
            aria-label="Upvote"
          >
            {votedUp ? <GoCheckCircleFill /> : <GoCheck />}
          </button>
          <button
            className={downvoteButtonClasses}
            onClick={() => buttonVoteChange("downvote")}
            disabled={isVoting || votedDown}
            aria-label="Downvote"
          >
            {votedDown ? <GoXCircleFill /> : <GoX />}
          </button>
        </div>
      </div>
    </article>
  );
}

function WebsiteList() {
  const scrollContainerRef = useRef(null);
  const hasLoadedInitial = useRef(false);
  const [websites, setWebsites] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("All Websites");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchWebsites = useCallback(
    async function (pageNumber) {
      if (isFetching || !hasMore) {
        return;
      }

      setIsFetching(true);

      try {
        const params = new URLSearchParams({
          page: String(pageNumber),
          limit: "10",
          ascending: "false",
        });

        const response = await fetch("/api?" + params.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch websites");
        }

        const result = await response.json();
        const newWebsites = result.data || [];

        if (newWebsites.length === 0) {
          setHasMore(false);
        } else {
          setWebsites(function (prev) {
            return prev.concat(newWebsites);
          });
          setPage(function (prev) {
            return prev + 1;
          });
        }
      } catch (err) {
        setError("Failed to load websites. Please try again later.");
      } finally {
        setIsFetching(false);
        setIsLoading(false);
      }
    },
    [hasMore, isFetching]
  );

  useEffect(() => {
    if (hasLoadedInitial.current) {
      return;
    }
    hasLoadedInitial.current = true;
    fetchWebsites(1);
  }, [fetchWebsites]);

  const handleScrollToBottom = useCallback(() => {
    if (!isFetching && hasMore) {
      fetchWebsites(page);
    }
  }, [fetchWebsites, hasMore, isFetching, page]);

  useEffect(() => {
    function handleScroll() {
      const container = scrollContainerRef.current;
      if (container && container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
        handleScrollToBottom();
      }
    }

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScrollToBottom]);

  function handleVoteError(message) {
    setError(message);
    window.setTimeout(function () {
      setError("");
    }, 5000);
  }

  const filteredWebsites = websites.filter(function (website) {
    if (!selectedTag || selectedTag === "All Websites") {
      return true;
    }
    if (!website.tags || website.tags.length === 0) {
      return false;
    }
    return website.tags.includes(selectedTag);
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-theme-text">Discover Links</h2>
          <p className="text-sm text-theme-subtle">Explore what others are sharing and find your next favorite site.</p>
        </div>
        <div className="relative w-full sm:w-56">
          <select
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value)}
            className="w-full appearance-none rounded-2xl border border-theme-border bg-theme-input px-4 py-3 text-sm text-theme-text focus:border-theme-primary focus:outline-none"
          >
            {[
              "All Websites",
              "Personal Website",
              "Entertainment",
              "Mainstream",
              "Technology",
              "Education",
              "Sports",
            ].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <GoChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-theme-subtle" />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-theme-danger/40 bg-theme-surfaceMuted px-4 py-3 text-sm text-theme-danger">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-theme-border bg-theme-surface p-4 shadow-surface">
        <div
          ref={scrollContainerRef}
          className="max-h-[540px] space-y-3 overflow-y-auto pr-2"
        >
          {isLoading && (
            <div className="py-12 text-center text-sm text-theme-subtle">Loading links...</div>
          )}

          {!isLoading && filteredWebsites.length === 0 && (
            <div className="py-12 text-center text-sm text-theme-subtle">
              No links match this tag yet. Be the first to share one!
            </div>
          )}

          {filteredWebsites.map((website, idx) => (
            <DisplaySingleWebsite
              key={website.website_name + idx}
              websiteInfo={website}
              index={idx}
              onVoteError={handleVoteError}
            />
          ))}

          {isFetching && !isLoading && (
            <div className="py-4 text-center text-sm text-theme-subtle">Loading more...</div>
          )}

          {!hasMore && websites.length > 0 && (
            <div className="py-4 text-center text-xs text-theme-subtle">You have reached the end of the list.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = "LinkPluck";
  }, []);

  return (
    <div className="flex flex-col gap-8 py-10">
      <AddWebsiteCard />
      <WebsiteList />
      <FeedbackForm className="mt-4" />
    </div>
  );
}
