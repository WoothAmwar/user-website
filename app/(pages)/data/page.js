"use client"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { GoCheck, GoCheckCircleFill, GoX, GoXCircleFill, GoLink } from "react-icons/go";
import * as d3 from 'd3';


const BarChart = ({ data }) => {
    const chartRef = useRef();

    useEffect(() => {
        const svgWidth = 500;
        const svgHeight = 300;
        const margin = { top: 20, right: 10, bottom: 40, left: 40 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        const svg = d3
            .select(chartRef.current)
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        const chart = svg
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const xScale = d3
            .scaleBand()
            .domain(data.map((d) => d.name))
            .range([0, chartWidth])
            .padding(0.1);

        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.value)])
            .nice()
            .range([chartHeight, 0]);

        chart
            .selectAll('.bar')
            .data(data)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', (d) => xScale(d.name))
            .attr('y', (d) => yScale(d.value))
            .attr('width', xScale.bandwidth())
            .attr('height', (d) => chartHeight - yScale(d.value))
            .attr('fill', '#3d71ff');

        // Add custom labels under each bar
        chart
            .selectAll('.bar-label')
            .data(data)
            .join('text')
            .attr('class', 'bar-label')
            .attr('x', (d) => xScale(d.name) + xScale.bandwidth() / 2)
            .attr('y', chartHeight + 15) // Position below the bars
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#ff6a3d')
            .text((d) => d.name);

        // Add y-axis
        chart
            .append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale));

        // Add the x-axis without labels
        chart
            .append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale).tickSize(0).tickFormat('')) // No tick labels
            .select('.domain')
            .remove(); // Remove the x-axis line
    }, [data]);

    return <svg ref={chartRef}></svg>;
};

const PercentageBar = ({ percentage }) => {
    // Clamp the percentage to ensure it's between 0 and 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

    const greenStyle = {
        width: `${clampedPercentage}%`,
        transition: 'width 0.3s ease',
    };

    const redStyle = {
        width: `${100 - clampedPercentage}%`,
        transition: 'width 0.3s ease',
    };

    return (
        <div className="flex w-full h-5 overflow-hidden rounded-md border-2 border-slate-500">
            <div className="bg-[#22C55E]" style={greenStyle}></div>
            <div className="bg-[#EF4444]" style={redStyle}></div>
        </div>
    );
};

const website_categories = ['Personal Website', 'Entertainment', 'Mainstream', 'Technology', 'Education', 'Sports'];

function FeedbackForm() {
    const [gaveFeedback, setGaveFeedback] = useState(false);
    const [feedbackContent, setFeedbackContent] = useState("");

    async function submit_form() {
        var form_data = new FormData(document.getElementById("feedback_form"));
        const feedback = form_data.get("feedback");

        // console.log("Days:", days_since_date(form_data.get("airing_date")));

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feedback_content: feedback,
                })
            });
            setFeedbackContent(feedback);
            setGaveFeedback(true);
        } catch (error) {
            console.log("Error giving feedback:", error);
        }
    }

    return (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-4">
            {gaveFeedback ? (
                <div className="text-[#ff6a3d]">
                    Received Feedback: <strong>{feedbackContent}</strong>
                </div>
            ) : (
                <div>
                    <form id="feedback_form" onSubmit={(e) => { e.preventDefault(); submit_form() }}>
                        <label className="font-semibold text-[#ff6a3d]" htmlFor="feedback">Feedback For This Website: </label>
                        <input
                            className="border-2 border-[#1a2238] rounded p-3 w-full mt-2 mb-4 focus:border-[#ff6a3d] focus:ring-[#ff6a3d]"
                            type="text"
                            name="feedback"
                            id="feedback"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-[#ff6a3d] text-white px-4 py-2 rounded hover:bg-[#ff6a3d]/80 transition-colors duration-150"
                        >
                            Submit Feedback
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

async function fetchWebsites() {
    try {
        const response = await fetch('/api', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch websites');
        }

        const data = await response.json();
        // setWebsites(data.data.sort((a, b) => b.website_upvotes - a.website_upvotes));
        return data.data;
    } catch (error) {
        setError("Failed to load websites. Please try again later.");
    }
}

function TagCounter() {
    const [allTags, setAllTags] = useState([]);
    const [allTagDicts, setAllTagDicts] = useState([]);

    const [gotTags, setGotTags] = useState(false);
    const [gotTagDicts, setGotTagDicts] = useState(false);
    useEffect(() => {
        async function websiteResults() {
            const temp_tag_dict = [];
            const website_results = await fetchWebsites();
            // console.log("DFL", website_results);
            website_results.forEach(website => {
                if (website.tags != null && website.tags.length > 0) {
                    website.tags.forEach(single_tag => {
                        setAllTags(prevTotalTags => [...prevTotalTags, single_tag]);
                        if (temp_tag_dict.length == 0) {
                            temp_tag_dict.push({ "name": single_tag, "value": 1 })
                        } else {
                            var found_tag = false;
                            for (var i = 0; i < temp_tag_dict.length; i++) {
                                if (temp_tag_dict[i]["name"] == single_tag) {
                                    temp_tag_dict[i] = { "name": single_tag, "value": temp_tag_dict[i]["value"] + 1 };
                                    found_tag = true;
                                    continue
                                }
                            }
                            if (!found_tag) {
                                temp_tag_dict.push({ "name": single_tag, "value": 1 });
                            }
                        }
                    })
                }
            });
            setGotTags(true);
            setAllTagDicts(temp_tag_dict);
            // console.log("TRU:", temp_tag_dict);
            setGotTagDicts(true);
            // setAllTags(website_results.sort((a, b) => b.website_upvotes - a.website_upvotes));
        }
        websiteResults();
    }, [])
    if (!gotTagDicts || !gotTags) {
        return (
            <div className="text-[#ff6a3d]">
                Loading...
            </div>
        )
    }
    return (
        <div className="text-[#ff6a3d]">
            <p className="font-bold text-xl">
                Number of Websites with a Specific Tag
            </p>
            <BarChart data={allTagDicts} />
            <p className="text-sm pl-6">*Does not show tags that have 0 websites</p>
        </div>
    )
}

function VoteGlobalCounter() {
    const [allUpVotes, setAllUpvotes] = useState(0);
    const [allDownVotes, setAllDownvotes] = useState(0);
    const [gotVoteNumbers, setGotVoteNumbers] = useState(false);

    useEffect(() => {
        async function websiteVoteResults() {
            if (!gotVoteNumbers) {
                const website_results = await fetchWebsites();
                var temp_upvotes = 0
                var temp_downvotes = 0
                website_results.forEach(website => {
                    // setAllUpvotes(prevUpvotes => prevUpvotes + website["website_upvotes"]);
                    // setAllDownvotes(prevDownvotes => prevDownvotes + website["website_remove_votes"]);
                    temp_upvotes += website["website_upvotes"]
                    temp_downvotes += website["website_remove_votes"]
                })
                setAllUpvotes(temp_upvotes);
                setAllDownvotes(temp_downvotes);
                setGotVoteNumbers(true);
            }
        }
        websiteVoteResults();
    }, [])

    if (!gotVoteNumbers) {
        return (
            <div className="text-[#ff6a3d]">
                Loading...
            </div>
        )
    }
    return (
        <div className="text-[#ff6a3d]">
            <div className="grid grid-cols-2 gap-x-4 text-3xl">
                <div className="grid grid-row-2">
                    <div className="text-6xl">{allUpVotes}</div>
                    <div>Upvotes</div>
                </div>
                <div className="grid grid-row-2">
                    <div className="text-6xl">{allDownVotes}</div>
                    <div>Downvotes</div>
                </div>
            </div>
            <PercentageBar percentage={allUpVotes / (allUpVotes + allDownVotes) * 100} />
            <p className="text-xs">*Stats are based on user votes on the entire website, which includes all websites</p>
        </div>
    )
}

export default function Home() {

    useEffect(() => {
        document.title = `Website Data`;
    }, [])

    return (
        <div className="min-h-screen bg-[#1a2238]">
            <div className="container mx-auto px-1 py-2">
                <div className="flex mb-4 mt-2">
                    <h1 className="flex-1 text-5xl font-bold text-[#ff6a3d]">Welcome!</h1>
                    <Link key={1} className="flex-1 rounded-lg text-right" href="/">
                        <p className="text-[#059669] text-4xl font-bold">Main Page</p>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
                            <p className="text-[#1a2238]">Here, you can see some of the <span className="font-bold">data</span> that I have
                                collected from the website ranking</p>

                            <p className="text-[#1a2238]">If you have any feedback on the website, or have any ideas for features to add to the website,
                                please type into the textbox and click on the <span className="font-bold">"Submit Feedback"</span> button at the bottom
                                of the website.</p>
                        </div>
                        <br />
                        {/* <RecentWebsites /> */}
                    </div>
                    <div className="lg:col-span-3">
                        <TagCounter />
                        <br />
                        <VoteGlobalCounter />
                    </div>
                </div>

                {/* Feedback Form */}
                <div className="pt-2">
                    <FeedbackForm />
                </div>
            </div>
        </div>
    );
}
