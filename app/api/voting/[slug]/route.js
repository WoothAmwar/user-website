// import { createClient } from '@/utils/supabase/server'

// /**
//  * Adds an anime obejct into the supabase database
//  * @param {Object} req Must have name, airing_date, is_priority, anime_cover, and anime_link. Can contain current_episode
//  * @returns 
//  */
// export async function POST(req, { params }) {
//     const vote_type = (await params).slug;  // Either upvote or downvote
//     const request_data = await req.json();  // has current_upvotes, current_downvotes, website_name
//     const supabase = await createClient();
//     const downvotes_to_remove = 10;
//     // console.log("CURR UP:", request_data?.current_upvotes);
//     // console.log("CURR DWN:", request_data?.current_downvotes);
//     const {data, error} = await supabase
//         .from("Websites")
//         .select()
//         .eq("website_name", request_data.website_name)
//     const current_upvotes = data[0]?.website_upvotes;
//     const current_downvotes = data[0]?.website_remove_votes;
//     console.log("CURR UP:", current_upvotes);
//     console.log("CURR DWN:", current_downvotes);

//     if (vote_type == "upvote") {
//         const { data, error } = await supabase
//             .from('Websites')
//             .update({
//                 website_upvotes: current_upvotes + 1,
//             })
//             .eq("website_name", request_data.website_name)
//             .select()
//     }
//     else {
//         if (current_downvotes + 1 >= downvotes_to_remove) {
//             console.log("GOOD BYE:");
//             const response = await supabase
//                 .from('Websites')
//                 .delete()
//                 .eq('website_name', request_data.website_name)
//             // console.log("DEL:", response);
//         } else {
//             const { data, error } = await supabase
//             .from('Websites')
//             .update({
//                 website_remove_votes: current_downvotes + 1,
//             })
//             .eq("website_name", request_data.website_name)
//             .select()
//         }
//     }
//     // console.log("INS DTA:", data);
//     // console.log("INS ERR:", error);
//     return Response.json({ "data": "data" }, {
//         status: 200
//     });
// }

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// Function to get or create a user identifier
// function getUserIdentifier(req) {
//   const cookieStore = cookies()
//   let userToken = cookieStore.get('voter_token')

//   if (!userToken) {
//     // Create a new token with a unique identifier
//     const newToken = jwt.sign(
//       { id: crypto.randomUUID() }, 
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '30d' }
//     )

//     // Set cookie options
//     cookieStore.set('voter_token', newToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
//     })

//     userToken = newToken
//   }

//   try {
//     const decoded = jwt.verify(userToken, process.env.JWT_SECRET || 'your-secret-key')
//     return decoded.id
//   } catch (error) {
//     throw new Error('Invalid token')
//   }
// }

async function getUserIdentifier(req) {
    const cookieStore = await cookies();
    let userToken = cookieStore.get('voter_token')

    if (!userToken) {
        console.log("No token found, creating new one");
        const newToken = jwt.sign(
            { id: crypto.randomUUID() },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        )

        // Set cookie options - modified for localhost
        cookieStore.set('voter_token', newToken, {
            httpOnly: true,
            secure: false, // Set to false for localhost
            sameSite: 'lax', // Changed from 'strict' to 'lax' for localhost
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        })

        userToken = newToken
    }

    try {
        console.log("Attempting to verify token:", userToken.value); // Add .value to get the actual token
        const decoded = jwt.verify(userToken.value, process.env.JWT_SECRET)
        return decoded.id
    } catch (error) {
        console.error("JWT Verification Error:", error);
        throw new Error('Invalid token')
    }
}

// export async function POST(req, { params }) {
//     // Add this temporarily at the top of your API route to test
//     console.log("JWT_SECRET:", process.env.JWT_SECRET);
//     const testToken = jwt.sign({ test: 'test' }, process.env.JWT_SECRET);
//     console.log("Test token creation works:", testToken);
//     try {
//     const verified = jwt.verify(testToken, process.env.JWT_SECRET);
//     console.log("Test token verification works:", verified);
//     } catch (error) {
//     console.error("Test token verification failed:", error);
//     }

//     try {
//         const vote_type = params.slug // Either upvote or downvote
//         const request_data = await req.json()
//         const supabase = await createClient()
//         const downvotes_to_remove = 10

//         // Get user identifier
//         const userId = await getUserIdentifier(req)

//         // Check if user has already voted on this website
//         const { data: existingVote } = await supabase
//             .from('Votes')
//             .select()
//             .match({
//                 user_id: userId,
//                 website_name: request_data.website_name
//             })

//         if (existingVote?.length > 0) {
//             return Response.json({
//                 error: 'You have already voted on this website'
//             }, { status: 400 })
//         }

//         // Get current website data
//         const { data: websiteData, error: websiteError } = await supabase
//             .from("Websites")
//             .select()
//             .eq("website_name", request_data.website_name)

//         if (websiteError || !websiteData?.length) {
//             return Response.json({
//                 error: 'Website not found'
//             }, { status: 404 })
//         }

//         const current_upvotes = websiteData[0].website_upvotes
//         const current_downvotes = websiteData[0].website_remove_votes

//         // Start a transaction to ensure data consistency
//         const { error: transactionError } = await supabase.rpc('handle_website_vote', {
//             p_user_id: userId,
//             p_website_name: request_data.website_name,
//             p_vote_type: vote_type,
//             p_current_upvotes: current_upvotes,
//             p_current_downvotes: current_downvotes,
//             p_downvotes_to_remove: downvotes_to_remove
//         })

//         if (transactionError) {
//             throw new Error('Failed to process vote')
//         }

//         return Response.json({
//             success: true
//         }, { status: 200 })

//     } catch (error) {
//         console.error('Vote error:', error)
//         return Response.json({
//             error: error.message || 'Internal server error'
//         }, { status: 500 })
//     }
// }

export async function POST(req, { params }) {
    try {
      const vote_type = params.slug // Either upvote or downvote
      const request_data = await req.json()
      const supabase = await createClient()
      const downvotes_to_remove = 10
      
      // Get user identifier
      const userId = await getUserIdentifier(req)
      console.log("User ID:", userId);
      
      // Check if user has already voted
      const { data: existingVote, error: voteCheckError } = await supabase
        .from('votes')
        .select()
        .match({ 
          user_id: userId,
          website_name: request_data.website_name 
        })
      
      console.log("Existing vote check:", existingVote, voteCheckError);
      
      if (existingVote?.length > 0) {
        return Response.json({ 
          error: 'You have already voted on this website' 
        }, { status: 400 })
      }
      
      // Insert the vote record
      const { error: voteInsertError } = await supabase
        .from('votes')
        .insert({
          user_id: userId,
          website_name: request_data.website_name,
          vote_type: vote_type
        })
      
      console.log("Vote insert error:", voteInsertError);
      
      if (voteInsertError) {
        throw new Error('Failed to record vote')
      }
      
      // Update the website votes
      if (vote_type === "upvote") {
        const { error: updateError } = await supabase
          .from('Websites')
          .update({
            website_upvotes: request_data.current_upvotes + 1
          })
          .eq("website_name", request_data.website_name)
        
        console.log("Update error:", updateError);
        
        if (updateError) throw new Error('Failed to update votes')
      } else {
        if (request_data.current_downvotes + 1 >= downvotes_to_remove) {
          const { error: deleteError } = await supabase
            .from('Websites')
            .delete()
            .eq('website_name', request_data.website_name)
            
          if (deleteError) throw new Error('Failed to delete website')
        } else {
          const { error: updateError } = await supabase
            .from('Websites')
            .update({
              website_remove_votes: request_data.current_downvotes + 1
            })
            .eq("website_name", request_data.website_name)
            
          if (updateError) throw new Error('Failed to update votes')
        }
      }
      
      return Response.json({ success: true }, { status: 200 })
      
    } catch (error) {
      console.error('Vote error:', error)
      return Response.json({ 
        error: error.message || 'Internal server error' 
      }, { status: 500 })
    }
  }