"use client"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from "react";
import Link from "next/link";
import { GoCheck, GoCheckCircleFill, GoX, GoXCircleFill, GoLink } from "react-icons/go";

const website_categories = ['Personal Website', 'Entertainment', 'Mainstream', 'Technology', 'Education', 'Sports'];

// function sort_websites_by_upvotes(a, b) {
//   if (a["website_upvotes"] < b["website_upvotes"]) {
//     return 1;
//   }
//   if (a["website_upvotes"] > b["website_upvotes"]) {
//     return -1;
//   }
//   return 0;
// }

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


function DisplaySingleWebsite({ website_info, idx, onVoteError }) {
  const [websiteUpvotes, setWebsiteUpvotes] = useState(0);
  const [websiteDownvotes, setWebsiteDownvotes] = useState(0);
  const [votedUp, setVotedUp] = useState(false);
  const [votedDown, setVotedDown] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isVoting, setIsVoting] = useState(false);
  const [websiteTag, setWebsiteTag] = useState("");
  const [websiteUserTags, setUserTags] = useState([]);

  useEffect(() => {
    setWebsiteUpvotes(website_info.website_upvotes);
    setWebsiteDownvotes(website_info.website_remove_votes);
    setWebsiteUrl(website_info.website_name.includes("https")
      ? website_info.website_name
      : `https://${website_info.website_name}`
    );
  }, [website_info]);

  useEffect(() => {
    async function getWebsiteTags() {
      try {
        const response = await fetch(`/api/tags/${website_info.website_name.split("/").join("|||")}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
          }
          // credentials: 'include' // Important for sending cookies
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Vote failed');
        }
        const data = await response.json();
        // console.log("DTA 3:", data["data"][0]["tags"]);
        setUserTags(data["data"][0]["tags"])
      } catch (err) {
        console.log("Error getting user tags for website:", err)
      }
    }

    getWebsiteTags();
  }, [])

  async function buttonVoteChange(vote_type) {
    if (isVoting || (votedUp && vote_type === "upvote") || (votedDown && vote_type === "downvote")) {
      return;
    }

    setIsVoting(true);

    try {
      const response = await fetch(`/api/voting/${vote_type}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_upvotes: websiteUpvotes,
          current_downvotes: websiteDownvotes,
          website_name: website_info.website_name,
        }),
        credentials: 'include' // Important for sending cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Vote failed');
      }

      // Update local state only after successful vote
      if (vote_type === "upvote") {
        setVotedUp(true);
        setWebsiteUpvotes(prev => prev + 1);
      } else {
        setVotedDown(true);
        setWebsiteDownvotes(prev => prev + 1);
      }

    } catch (error) {
      // Revert any optimistic updates
      if (vote_type === "upvote") {
        setVotedUp(false);
        setWebsiteUpvotes(website_info.website_upvotes);
      } else {
        setVotedDown(false);
        setWebsiteDownvotes(website_info.website_remove_votes);
      }

      // Show error message
      onVoteError(error.message);
    } finally {
      setIsVoting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="grid grid-cols-2 grid-rows-4 lg:grid-rows-1 lg:grid-cols-6 md:grid-cols-4 md:grid-rows-2 grid-flow-col gap-2 items-center">
        <div className="col-span-1 text-[#ff6a3d]">
          <div className="grid grid-cols-2 gap-1 items-center">
            <div className="font-semibold">
              #{idx + 1}
            </div>
            <div>
              {websiteTag}
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="grid grid-rows-2">
            <div>
              <a
                className="text-[#ff6a3d] hover:text-[#ff6a3d]/80 flex items-center gap-2"
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {websiteUrl}
                <GoLink className="inline-block" />
              </a>
            </div>
            <div className="text-[#A3A3A3] text-sm">
                {websiteUserTags != null ? websiteUserTags.join(", ") : []}
            </div>
          </div>
        </div>
        <div className="col-span-1 flex items-center justify-end pr-1">
          <div className={`text-[#1a2238] font-medium mr-2 ${websiteUpvotes > 9 ? 'text-base' : 'text-base'}`}>{websiteUpvotes} Votes</div>
          <div className="flex gap-1">
            <button
              className={`text-xl hover:text-[#ff6a3d] transition-colors ${isVoting ? 'opacity-50 cursor-not-allowed' : ''} ${votedUp ? 'text-[#ff6a3d]' : 'text-[#1a2238]'}`}
              onClick={() => buttonVoteChange("upvote")}
              disabled={isVoting || votedUp}
            >
              {votedUp ? <GoCheckCircleFill /> : <GoCheck />}
            </button>
            <button
              className={`text-xl hover:text-red-500 transition-colors ${isVoting ? 'opacity-50 cursor-not-allowed' : ''} ${votedDown ? 'text-red-500' : 'text-[#1a2238]'}`}
              onClick={() => buttonVoteChange("downvote")}
              disabled={isVoting || votedDown}
            >
              {votedDown ? <GoXCircleFill /> : <GoX />}
            </button>
          </div>
        </div>
      </div>
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

// function RecentWebsites() {
//   const [websites, setWebsites] = useState([]);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     async function websiteResults() {
//       const website_results = await fetchWebsites();
//       // console.log("DFL", website_results);
//       setIsLoading(false);
//       setWebsites(website_results.sort((a, b) => b.website_upvotes - a.website_upvotes).slice(0, Math.min(3, website_results.length)));
//     }
//     websiteResults();
//     // fetchWebsites();
//   }, []);

//   if (isLoading) {
//     return <div className="text-center py-4 text-[#ff6a3d]">Loading...</div>;
//   }

//   function handleVoteError(message) {
//     setError(message);
//     // Clear error after 5 seconds
//     setTimeout(() => setError(""), 5000);
//   }

//   return (
//     <div className="h-[80vh] overflow-y-auto pr-2 space-y-2 rounded-lg">
//       {websites.map((website, idx) => (
//         <DisplaySingleWebsite
//           key={website.website_name}
//           website_info={website}
//           idx={idx}
//           onVoteError={handleVoteError}
//         />
//       ))}
//     </div>
//   );
// }

function WebsiteList() {
  const [websites, setWebsites] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    async function websiteResults() {
      const website_results = await fetchWebsites();
      // console.log("DFL", website_results);
      setIsLoading(false);
      setWebsites(website_results.sort((a, b) => b.website_upvotes - a.website_upvotes));
    }
    websiteResults();
    // fetchWebsites();
  }, []);

  const DropdownForm = () => {
    return (
      <select
        value={selectedTag}
        onChange={(e) => {
          setSelectedTag(e.target.value)
        }}
        className="w-full p-2 border rounded-lg"
      >
        <option value="" disabled>Select Tag Filter</option>
        {['All Websites'].concat(website_categories).map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  function handleVoteError(message) {
    setError(message);
    // Clear error after 5 seconds
    setTimeout(() => setError(""), 5000);
  }

  if (isLoading) {
    return <div className="text-center py-4 text-[#ff6a3d]">Loading...</div>;
  }

  return (
    <div className="my-2">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="my-2">
        <DropdownForm />
      </div>
      <div className="h-[80vh] overflow-y-auto pr-2 space-y-2 rounded-lg">
        {websites.map((website, idx) => (
          (selectedTag==''||selectedTag=='All Websites' ? true : 
            (website.tags!=null&&website.tags.length>0 ? website.tags.includes(selectedTag) : false)) &&
          <DisplaySingleWebsite
            key={website.website_name}
            website_info={website}
            idx={idx}
            onVoteError={handleVoteError}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [addedWebsite, setAddedWebsite] = useState(false);
  const [votedTicker, setVotedTicker] = useState(0);

  function AddWebsite() {
    // const website_categories = ['Personal Website', 'Entertainment', 'Mainstream', 'Technology', 'Education', 'Sports'];
    async function submit_form() {
      var form_data = new FormData(document.getElementById("add_website_form"));
      const name = form_data.get("name");
      const website_tags = form_data.getAll("categories")

      // console.log("Days:", days_since_date(form_data.get("airing_date")));

      try {
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
            tags: website_tags
          })
        });
        const raw_data = await response.json();
        if (raw_data["data"]["valid"] == 1) {
          setAddedWebsite(true);
        }
      } catch (error) {
        console.log("Error adding website:", error);
      }
    }

    return (
      // <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      //   <form id="add_website_form" onSubmit={(e) => { e.preventDefault(); submit_form() }} className="space-y-4">
      //     <div>
      //       <label className="font-semibold text-[#ff6a3d] block mb-2" htmlFor="name">Website URL to Add</label>
      //       <input
      //         className="border-2 border-[#1a2238] rounded p-3 w-full focus:border-[#ff6a3d] focus:ring-[#ff6a3d]"
      //         type="text"
      //         name="name"
      //         id="name"
      //         required
      //       />
      //     </div>
      //     <button
      //       type="submit"
      //       className="bg-[#ff6a3d] text-white px-6 py-2 rounded hover:bg-[#ff6a3d]/80 transition-colors duration-150"
      //     >
      //       Add Website
      //     </button>
      //   </form>
      // </div>
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <form id="add_website_form" onSubmit={(e) => { e.preventDefault(); submit_form() }} className="space-y-4">
          <div>
            <label className="font-semibold text-[#ff6a3d] block mb-2" htmlFor="name">Website URL to Add</label>
            <input
              className="border-2 border-[#1a2238] rounded p-3 w-full focus:border-[#ff6a3d] focus:ring-[#ff6a3d]"
              type="text"
              name="name"
              id="name"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#ff6a3d] block mb-2">Tags for the Website(Optional)</label>
            <div className="flex flex-wrap gap-4">
              {website_categories.map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="categories"
                    value={category}
                    className="rounded border-[#1a2238] text-[#ff6a3d] focus:ring-[#ff6a3d]"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#ff6a3d] text-white px-6 py-2 rounded hover:bg-[#ff6a3d]/80 transition-colors duration-150"
          >
            Add Website
          </button>
        </form>
      </div>
    );
  }

  useEffect(() => {
    document.title = `Website Ranker`;
  }, [])

  return (
    <div className="min-h-screen bg-[#1a2238]">
      <div className="container mx-auto px-1 py-2">
        <div className="flex mb-4 mt-2">
          <h1 className="flex-1 text-4xl font-bold text-[#ff6a3d]">Welcome!</h1>
          <Link key={1} className="flex-1 rounded-lg text-right" href="/data">
              <p className="font-['Garamond'] text-[#ff6a3d] text-3xl">Data Page</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
              <p className="text-[#1a2238]">Here, you can add the <span className="font-bold">link</span> to any cool websites that you find and  
              <span className="font-bold"> vote</span> on websites that you like or don't like.</p>

              <p className="text-[#1a2238]">When adding a website, you can choose <span className="font-bold">tags</span> that represent what content
              is on the website.</p>

              <p className="font-bold text-red-600">If you get the error "Invalid Token", try reloading the page</p>

              <p className="text-[#1a2238]">If a website gets enough down votes, it will be removed from the list</p>

              <p className="text-[#1a2238]">For Websites you Do Like, click the Check Mark next to the website name</p>

              <p className="text-[#1a2238]">For Websites you Do Not Like, click the X Mark next to the website name</p>

              <p className="text-[#1a2238]">If you have any feedback on the website, or have any ideas for features to add to the website,
                please type into the textbox below and click on the <span className="font-bold">"Submit Feedback"</span> button at the bottom 
                of the website.</p>
            </div>
             <br />
            {/* <RecentWebsites /> */}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AddWebsite />
            <WebsiteList />
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
