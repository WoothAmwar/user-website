"use client"
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from "react";

export default function Home() {
  const [addedWebsite, setAddedWebsite] = useState(false);

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
          setAddedWebsite(true);
      } catch (error) {
          console.log("Error adding website:", error);
      }
  }
  
    return (
      <div>
        <form id="add_website_form" onSubmit={(e) => { e.preventDefault(); submit_form() }}>
          <label htmlFor="name">Website Name</label>
          <input className="border-2 border-neutral-500 rounded" type="text" name="name" id="name" required />
  
          <button type="submit">Add Website</button>
        </form>
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
          console.log("P:", data["data"])
          setAllWebsitesInfo(data["data"]);
        })
    }, [addedWebsite])
  
    return (
      <div className="flex flex-col align-center">
        {all_websites_info.map((element, idx) => {
          return (
            <div key={idx}>
              <div className="grid grid-cols-10">
                <div className="col-span-1">{idx}</div>
                <div className="col-span-6">{element.website_name}</div>
                <div className="col-span-1">{element?.website_upvotes} </div>
                <div className="col-span-2">Vote X</div>
              </div>
            </div>
          );
        })}
      </div>
    )
  }

  return (
    <div>
      <h1>Welcome!</h1>
      <div className="grid grid-cols-4">
        <div className="col-start-1 col-span-1">
          Here, you can add your own website to share to others, upvote other website you see, or vote to remove a website
          that you think others should not use.
        </div>

        <div className="col-start-2 col-span-2">
          <AddWebsite />
          <DisplayWebsites />
        </div>

        <div className="col-start-4 col-span-1">
          <p>About:</p>
        </div>
      </div>
    </div>
  );
}
