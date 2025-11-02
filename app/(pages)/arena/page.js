"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GoCheck, GoCheckCircleFill, GoChevronDown, GoLink, GoPlus, GoX, GoXCircleFill } from "react-icons/go";
import { FeedbackForm } from "@/app/components/FeedbackForm";

function DisplaySingleWebsite({ websiteInfo, index, onVoteError, postVoteFunction }) {
  const [websiteUpvotes, setWebsiteUpvotes] = useState(0);
  const [votedUp, setVotedUp] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [websiteUserTags, setUserTags] = useState([]);
  const lastFetchedSlug = useRef("");

  useEffect(() => {
    setWebsiteUpvotes(websiteInfo.website_upvotes);
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
      (votedUp && voteType === "upvote")
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
      } 
    } catch (error) {
      if (voteType === "upvote") {
        setVotedUp(false);
        setWebsiteUpvotes(websiteInfo.website_upvotes);
      }

      onVoteError(error.message);
    } finally {
      setIsVoting(false);
    }
  }

  useEffect(() => {
    if (!votedUp) return;
    const timer = setTimeout(() => {
      postVoteFunction && postVoteFunction();
    }, 1000);
    return () => clearTimeout(timer);
  }, [votedUp, postVoteFunction]);

  const upvoteButtonClasses = [
    "flex h-10 w-10 items-center justify-center rounded-full border border-theme-border transition-colors",
    votedUp ? "bg-theme-primary text-white" : "text-theme-subtle hover:text-theme-text",
    isVoting ? "opacity-60" : "",
  ].join(" ");

  return (
    <article className="rounded-2xl border border-theme-border bg-theme-surfaceMuted px-4 py-4 transition-colors hover:border-theme-primary/60">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:flex-1">
          {/* <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-theme-border bg-theme-surface text-sm font-semibold text-theme-subtle">
            {"#" + (index + 1)}
          </span> */}

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
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  const fetchWebsites = useCallback(async (tag) => {
    setIsFetching(true);
    setIsLoading(true);
    setError("");

    try {
        if (tag == "All Websites") {
            tag = ""
        }
      const params = new URLSearchParams({
        tag: tag,
      });

      const response = await fetch("/api/random?" + params.toString(), {
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

      if (newWebsites.length < 2) { // The API returns 2 websites
        setHasMore(false);
      }
      setWebsites(newWebsites);

    } catch (err) {
      setError("Failed to load websites. Please try again later.");
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebsites(selectedTag);
  }, [selectedTag, fetchWebsites]);

  const handleNext = () => {
    if (!isFetching) {
        fetchWebsites(selectedTag);
    }
  };

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

          <div className="flex flex-row">
            {filteredWebsites.map((website, idx) => (
              <div key={website.website_name + idx} className="grow m-2">
                <DisplaySingleWebsite
                  websiteInfo={website}
                  index={idx}
                  onVoteError={handleVoteError}
                  postVoteFunction={handleNext}
                />
              </div>
            ))}
          </div>

          {!isLoading && hasMore && (
            <button onClick={handleNext} disabled={isFetching} className="w-full mt-4 rounded-2xl bg-theme-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-theme-primaryHover disabled:opacity-60">
                {isFetching ? "Loading..." : "Next Match"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Arena() {
  useEffect(() => {
    document.title = "LinkPluck";
  }, []);

  return (
    <div className="flex flex-col gap-8 py-10">
      <WebsiteList />
      <FeedbackForm className="mt-4" />
    </div>
  );
}
