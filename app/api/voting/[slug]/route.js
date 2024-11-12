import { createClient } from '@/utils/supabase/server'

/**
 * Adds an anime obejct into the supabase database
 * @param {Object} req Must have name, airing_date, is_priority, anime_cover, and anime_link. Can contain current_episode
 * @returns 
 */
export async function POST(req, { params }) {
    const vote_type = (await params).slug;  // Either upvote or downvote
    const request_data = await req.json();  // has current_upvotes, current_downvotes, website_name
    const supabase = await createClient();
    const downvotes_to_remove = 5;
    // console.log("CURR UP:", request_data?.current_upvotes);
    // console.log("CURR DWN:", request_data?.current_downvotes);
    const {data, error} = await supabase
        .from("Websites")
        .select()
        .eq("website_name", request_data.website_name)
    const current_upvotes = data[0]?.website_upvotes;
    const current_downvotes = data[0]?.website_remove_votes;
    console.log("CURR UP:", current_upvotes);
    console.log("CURR DWN:", current_downvotes);

    if (vote_type == "upvote") {
        const { data, error } = await supabase
            .from('Websites')
            .update({
                website_upvotes: current_upvotes + 1,
            })
            .eq("website_name", request_data.website_name)
            .select()
    }
    else {
        if (current_downvotes + 1 >= downvotes_to_remove) {
            console.log("GOOD BYE:");
            const response = await supabase
                .from('Websites')
                .delete()
                .eq('website_name', request_data.website_name)
            // console.log("DEL:", response);
        } else {
            const { data, error } = await supabase
            .from('Websites')
            .update({
                website_remove_votes: current_downvotes + 1,
            })
            .eq("website_name", request_data.website_name)
            .select()
        }
    }
    // console.log("INS DTA:", data);
    // console.log("INS ERR:", error);
    return Response.json({ "data": "data" }, {
        status: 200
    });
}
