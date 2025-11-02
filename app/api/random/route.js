import { createClient } from '@/utils/supabase/server'


export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag').toString();


    const supabase = await createClient();
    console.log("T:", tag);
    const { data, error } = await supabase.rpc('get_random_websites', { tag: tag });

    // console.log("DTA:", data);
    // console.log("ERR:", error);


    return Response.json({ "data": data }, {
        status: 200
    });
}