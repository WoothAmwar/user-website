import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { TokenExpiredError } from 'jsonwebtoken';


function createToken(cookieStore, cookie_str) {
  const newToken = jwt.sign(
    { id: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

  // Set cookie options - modified for localhost
  cookieStore.set(cookie_str, newToken, {
    httpOnly: true,
    secure: false, // Set to false for localhost
    sameSite: 'lax', // Changed from 'strict' to 'lax' for localhost
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  })

  return newToken
}

async function getUserIdentifier(req) {
  const cookieStore = await cookies();
  let userToken = cookieStore.get('voter_token')

  if (!userToken) {
    userToken = createToken(cookieStore, 'voter_token')
  }

  try {
    const decoded = jwt.verify(userToken.value, process.env.JWT_SECRET)
    return decoded.id
  }
  catch (error) {
    if (error instanceof TokenExpiredError) {
      console.log("Token expired, creating new one")
      userToken = createToken(cookieStore, 'voter_token')
      try {
        const decoded = jwt.verify(userToken.value, process.env.JWT_SECRET)
        return decoded.id
      } catch (error) {
        throw new Error('Invalid token')
      }

    } else {
      throw new Error('Invalid token')
    }
  }
}

export async function POST(req, { params }) {
  try {
    const vote_type = await params?.slug // Either upvote or downvote
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
        error: 'You have already voted for this website'
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