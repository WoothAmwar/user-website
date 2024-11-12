"use client"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from "react";
import { GoCheck, GoCheckCircleFill, GoX, GoXCircleFill, GoLink } from "react-icons/go";


function sort_websites_by_upvotes(a, b) {
  if (a["website_upvotes"] < b["website_upvotes"]) {
    return 1;
  }
  if (a["website_upvotes"] > b["website_upvotes"]) {
    return -1;
  }
  return 0;
}

export default function Home() {
  const [addedWebsite, setAddedWebsite] = useState(false);
  const [votedTicker, setVotedTicker] = useState(0);

  function AddWebsite() {
    async function submit_form() {
      var form_data = new FormData(document.getElementById("add_website_form"));
      const name = form_data.get("name");

      // console.log("Days:", days_since_date(form_data.get("airing_date")));

      try {
        const response = await fetch("/api", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
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
      <div>
        <form id="add_website_form" onSubmit={(e) => { e.preventDefault(); submit_form() }}>
          <label className="font-semibold" htmlFor="name">Website Name to Add </label>
          <input className="border-2 border-neutral-500 rounded" type="text" name="name" id="name" required />

          <button type="submit">Add Website</button>
        </form>
      </div>
    )
  }

  function DisplaySingleWebsite({ website_info, idx }) {
    const [websiteUpvotes, setWebsiteUpvotes] = useState(0);
    const [websiteDownvotes, setWebsiteDownvotes] = useState(0);
    const [votedUp, setVotedUp] = useState(false);
    const [votedDown, setVotedDown] = useState(false);


    useEffect(() => {
      setWebsiteUpvotes(website_info.website_upvotes);
      setWebsiteDownvotes(website_info.website_remove_votes);
    }, [])
    // current_upvotes, current_downvotes, website_name
    async function buttonVoteChange(vote_type) {
      try {
        const response = await fetch(`/api/voting/${vote_type}`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_upvotes: websiteUpvotes,
            current_downvotes: websiteDownvotes,
            website_name: website_info.website_name
          })
        });
        if (!response.ok) {
          // Revert on error
          setWebsiteUpvotes(websiteUpvotes);
          setWebsiteDownvotes(websiteDownvotes);
          throw new Error('Vote update failed');
        }
      } catch (error) {
        console.log("Error changing vote", error);
      }
    }
  
    return (
      <div className="grid grid-cols-2 grid-rows-4 lg:grid-rows-1 lg:grid-cols-6 md:grid-cols-4 md:grid-rows-2 grid-flow-col border-2">
        <div className="col-span-1">#{idx+1}</div>
        <div className="col-span-4"><a className="link" href={`${website_info.website_name}`}>{website_info.website_name}<GoLink /></a></div>
        <div className="col-span-1 grid grid-cols-3">
          <div className="col-span-2">{websiteUpvotes} Votes </div>
          <div className="col-span-1">
            <button className="mx-2" onClick={() => {setVotedUp(true);  if (!votedUp) {setWebsiteUpvotes(websiteUpvotes+1);buttonVoteChange("upvote");}}}>
              {votedUp ? <GoCheckCircleFill /> : <GoCheck />}
            </button>
            <button className="mx-2" onClick={() => {setVotedDown(true); if (!votedDown) {setWebsiteDownvotes(websiteDownvotes+1);buttonVoteChange("downvote");} if (websiteDownvotes>4) { setVotedTicker(votedTicker-1);}}}>
              {votedDown ? <GoXCircleFill /> : <GoX />} 
              {/* {websiteDownvotes} */}
            </button>
          </div>
        </div>
      </div>
    )
  }

  function DisplayWebsites() {
    const [all_websites_info, setAllWebsitesInfo] = useState([]);
    // const all_websites_info = get_all_website_info();
    useEffect(() => {
      fetch(`/api`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => response.json())
        .then(data => {
          var resp_data = data["data"];
          resp_data = resp_data.sort(sort_websites_by_upvotes);
          setAllWebsitesInfo(resp_data);
        })
    }, [addedWebsite, votedTicker])

    return (
      <div className="flex flex-col align-center">
        {all_websites_info.map((element, idx) => {
          return (
            <div key={idx}>
              <DisplaySingleWebsite website_info={element} idx={idx} />
            </div>
          );
        })}
      </div>
    )
  }

  return (
    <div>
      <p className="text-4xl">Welcome!</p>
      <div className="grid grid-cols-4 gap-x-3">
        <div className="col-start-1 col-span-1 border-r-2 border-gray-700 border-solid px-3">
          <p>Here, you can add the link to any cool websites that you find and vote 
            on websites that you like or don't like. </p>
          <br />
          <p>If a website gets enough down votes, it will be removed from the list</p>
          <br />
          <p>For Websites you Do Like, click the Check Mark next to the website name</p>
          <br />
          <p>For Websites you Do Not Like, click the X Mark next to the website name</p>
        </div>

        <div className="col-start-2 col-span-3 px-3">
          <AddWebsite />
          <DisplayWebsites />
        </div>
      </div>
    </div>
  );
}
