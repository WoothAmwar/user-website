"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { FeedbackForm } from "@/app/components/FeedbackForm";

const chartDimensions = {
  width: 560,
  height: 340,
  margin: { top: 32, right: 16, bottom: 64, left: 56 },
};

const PercentageBar = ({ percentage }) => {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="flex h-3 overflow-hidden rounded-full border border-theme-border bg-theme-surfaceMuted">
      <div
        style={{ width: clamped + "%", backgroundColor: "var(--color-success)" }}
        className="transition-[width] duration-500"
      />
      <div
        style={{ width: 100 - clamped + "%", backgroundColor: "var(--color-danger)" }}
        className="transition-[width] duration-500"
      />
    </div>
  );
};

const BarChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }

    const rootStyles = getComputedStyle(document.body);
    const primary = rootStyles.getPropertyValue("--color-primary").trim() || "#3b82f6";
    const border = rootStyles.getPropertyValue("--color-border").trim() || "#1f2f4f";
    const text = rootStyles.getPropertyValue("--color-text").trim() || "#f8fafc";
    const subtle = rootStyles.getPropertyValue("--color-subtle").trim() || "#94a3b8";

    const { width, height, margin } = chartDimensions;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const chart = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3
      .scaleBand()
      .domain(data.map(function (d) {
        return d.name;
      }))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, function (d) {
        return d.value;
      }) || 0])
      .nice()
      .range([chartHeight, 0]);

    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return xScale(d.name);
      })
      .attr("y", function (d) {
        return yScale(d.value);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) {
        return chartHeight - yScale(d.value);
      })
      .attr("rx", 12)
      .attr("fill", primary);

    const xAxis = chart
      .append("g")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(d3.axisBottom(xScale));

    xAxis
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end")
      .style("fill", subtle)
      .style("font-size", "12px");

    xAxis.select(".domain").attr("stroke", border);
    xAxis.selectAll(".tick line").attr("stroke", border);

    const yAxis = chart.append("g").call(d3.axisLeft(yScale).ticks(5));
    yAxis.selectAll("text").style("fill", subtle);
    yAxis.selectAll("path, line").attr("stroke", border);

    chart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + margin.bottom - 12)
      .attr("text-anchor", "middle")
      .style("fill", subtle)
      .style("font-size", "12px")
      .text("Tags");

    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -margin.left + 16)
      .attr("text-anchor", "middle")
      .style("fill", subtle)
      .style("font-size", "12px")
      .text("Websites");

    chart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -12)
      .attr("text-anchor", "middle")
      .style("fill", text)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Websites per tag");
  }, [data]);

  return <svg ref={chartRef} />;
};

async function fetchWebsites() {
  try {
    const response = await fetch("/api?limit=1000", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch websites");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to load websites:", error);
    return [];
  }
}

function TagCounter() {
  const [tagData, setTagData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTagCounts() {
      setIsLoading(true);
      const websites = await fetchWebsites();
      if (!isMounted) {
        return;
      }

      const counts = new Map();
      websites.forEach(function (website) {
        if (website.tags && website.tags.length > 0) {
          website.tags.forEach(function (tag) {
            counts.set(tag, (counts.get(tag) || 0) + 1);
          });
        }
      });

      const dataset = Array.from(counts.entries())
        .map(function ([name, value]) {
          return { name, value };
        })
        .sort(function (a, b) {
          return b.value - a.value;
        });

      setTagData(dataset);
      setIsLoading(false);
    }

    loadTagCounts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-theme-border bg-theme-surface p-6 text-sm text-theme-subtle shadow-surface">
        Loading tag data...
      </div>
    );
  }

  if (tagData.length === 0) {
    return (
      <div className="rounded-3xl border border-theme-border bg-theme-surface p-6 text-sm text-theme-subtle shadow-surface">
        No tag data yet. Share a few links to get the insights flowing.
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-3xl border border-theme-border bg-theme-surface p-6 shadow-surface">
      <div>
        <h2 className="text-xl font-semibold text-theme-text">Popular Tags</h2>
        <p className="text-sm text-theme-subtle">See which topics have the most submissions across LinkPluck.</p>
      </div>
      <BarChart data={tagData} />
      {/* <p className="text-xs text-theme-subtle">*Only websites loaded up on the homepage appear here, not all websites submitted.</p> */}
      <p className="text-xs text-theme-subtle">*Only tags applied to at least one website appear in this chart.</p>
    </section>
  );
}

function VoteGlobalCounter() {
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadVotes() {
      const websites = await fetchWebsites();
      if (!isMounted) {
        return;
      }

      let totalUp = 0;
      let totalDown = 0;
      websites.forEach(function (website) {
        totalUp += website.website_upvotes || 0;
        totalDown += website.website_remove_votes || 0;
      });

      setUpvotes(totalUp);
      setDownvotes(totalDown);
      setIsLoading(false);
    }

    loadVotes();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-theme-border bg-theme-surface p-6 text-sm text-theme-subtle shadow-surface">
        Loading vote totals...
      </section>
    );
  }

  const totalVotes = upvotes + downvotes;
  const approval = totalVotes === 0 ? 0 : (upvotes / totalVotes) * 100;

  return (
    <section className="space-y-5 rounded-3xl border border-theme-border bg-theme-surface p-6 shadow-surface">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-theme-text">Community Votes</h2>
          <p className="text-sm text-theme-subtle">
            Aggregate votes across every submission. Each visitor can vote once per link.
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-3xl font-semibold text-theme-text">{upvotes}</p>
            <p className="text-xs uppercase tracking-wide text-theme-subtle">Upvotes</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-theme-text">{downvotes}</p>
            <p className="text-xs uppercase tracking-wide text-theme-subtle">Downvotes</p>
          </div>
        </div>
      </div>
      <PercentageBar percentage={approval} />
      {/* <p className="text-xs text-theme-subtle">*Stats include every website currently listed.</p> */}
    </section>
  );
}

export default function DataPage() {
  useEffect(() => {
    document.title = "Data • LinkPluck";
  }, []);

  return (
    <div className="flex flex-col gap-8 py-10">
      <section className="rounded-3xl border border-theme-border bg-theme-surface p-8 shadow-surface">
        <h1 className="text-3xl font-semibold text-theme-text">Community Insights</h1>
        <p className="mt-3 text-sm text-theme-subtle">
          Explore how LinkPluck is growing. Tag trends highlight what types of websites are most popular, while vote totals show
          how the community feels about the agregate websites.
        </p>
      </section>

      <TagCounter />
      <VoteGlobalCounter />
      <FeedbackForm />
    </div>
  );
}
