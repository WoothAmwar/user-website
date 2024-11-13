import { createClient } from '@/utils/supabase/server'

/**
 * Adds an anime obejct into the supabase database
 * @param {Object} req Must have name, airing_date, is_priority, anime_cover, and anime_link. Can contain current_episode
 * @returns 
 */
export async function POST(req, { params }) {
    const request_data = await req.json();  // has current_upvotes, current_downvotes, website_name
    const supabase = await createClient();
    // console.log("CURR UP:", request_data?.current_upvotes);
    // console.log("CURR DWN:", request_data?.current_downvotes);

    const { data, error } = await supabase
    .from('Feedback')
    .insert({feedback_content: request_data?.feedback_content, feedback_target: "user-website"})
    
    // console.log("INS DTA:", data);
    // console.log("INS ERR:", error);
    return Response.json({ "data": "data" }, {
        status: 200
    });
}
