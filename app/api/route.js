import { createClient } from '@/utils/supabase/server'

/**
 * Adds an anime obejct into the supabase database
 * @param {Object} req Must have name, airing_date, is_priority, anime_cover, and anime_link. Can contain current_episode
 * @returns 
 */
export async function POST(req) {
    const request_data = await req.json();  // contains --- name:string, tags: string[]
    const supabase = await createClient();
    // const website_name = "https://app.flocus.com";
    if (!valid_website({website_name: request_data.name})) {
        return Response.json({ "data": {"valid": 0} }, {
            status: 200
        });
    }
    const { data, error } = await supabase
        .from('Websites')
        .insert({
            website_name: request_data.name,
            website_upvotes:0,
            website_remove_votes:0,
            tags: request_data.tags
        })
        .select()
    // console.log("INS DTA:", data);
    // console.log("INS ERR:", error);
    return Response.json({ "data": {"valid": 1} }, {
        status: 200
    });
}

const valid_website = ({website_name}) => {
    console.log("WEBN:", website_name);
    const bad_words = ["porn", "sex", "nude", "naked", "hentai", "boob", "nsfw", "ass", "tit", "cock", "penis", "fuck", "shit", "bitch", "nigg"];
    for (var i=0; i<bad_words.length; i++) {
        if (website_name.includes(bad_words[i])) {
            return false
        }
    }
    return true
}

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const ascendingUpvotes = searchParams.get('ascending')=='true';

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    const supabase = await createClient();
    var { data, error } = await supabase
        .from('Websites')
        .select()
        .order('website_upvotes', { ascending: ascendingUpvotes })
        .order('created_at', { ascending: false })
        .range(startIndex, endIndex)

    // console.log("GET DTA:", data);
    // console.log("GET ERR:", error);
    return Response.json({ "data": data }, {
        status: 200
    });
}
