import { createClient } from '@/utils/supabase/server'

// export async function POST(req) {
//     const p = await params;
//     const website_url = p.slug;
//     const supabase = await createClient();
//     var { data, error } = await supabase
//         .from('Websites')
//         .select('tags, website_name')
//         .eq('website_name', website_url)
//     console.log("GET DTA:", data);
//     // console.log("GET ERR:", error);
//     return Response.json({ "data": data }, {
//         status: 200
//     });
// }

export async function GET(req, { params}) {
    const p = await params;
    const website_url = p.slug.split('|||').join('/');
    const supabase = await createClient();
    var { data, error } = await supabase
        .from('Websites')
        .select('tags, website_name')
        .eq('website_name', website_url)
    // console.log("GET DTA:", data);
    // console.log("GET ERR:", error);
    return Response.json({ "data": data }, {
        status: 200
    });
}

