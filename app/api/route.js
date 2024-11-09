import { createClient } from '@/utils/supabase/server'

/**
 * Adds an anime obejct into the supabase database
 * @param {Object} req Must have name, airing_date, is_priority, anime_cover, and anime_link. Can contain current_episode
 * @returns 
 */
export async function POST(req) {
    const request_data = await req.json();
    const supabase = await createClient();
    // const website_name = "https://app.flocus.com";
    const { data, error } = await supabase
        .from('Websites')
        .insert({
            website_name: request_data.name,
            website_upvotes:0,
            website_remove_votes:0
        })
        .select()
    console.log("INS DTA:", data);
    console.log("INS ERR:", error);
    return Response.json({ "data": data }, {
        status: 200
    });
}

export async function GET(req) {
    const supabase = await createClient();
    var { data, error } = await supabase
        .from('Websites')
        .select()
    console.log("GET DTA:", data);
    console.log("GET ERR:", error);
    return Response.json({ "data": data }, {
        status: 200
    });
}

export async function DELETE(req) {
    const request_data = await req.json();

    const supabase = createClient();
    const { data, error } = await supabase
        .from('anime_info')
        .delete()
        .eq('anime_name', request_data.name)
        .select()

    return Response.json({ "data": data }, {
        status: 200
    });
}

export async function PUT(req) {
    const request_data = await req.json();
    const supabase = createClient();
    const { data, error } = await supabase
        .from('anime_info')
        .update({
            current_episode: request_data?.current_episode
        })
        .eq('anime_name', request_data.name)
        .select()

    return Response.json({ "data": data }, {
        status: 200
    });
}
