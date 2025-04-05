// src/app/api/leaderboard/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';     // Adjust path if models is not directly under src

// Define how many users to return per request (optional, good for pagination later)
const LEADERBOARD_LIMIT = 100; // Get top 100 users

export async function GET(request) {
  try {
    await dbConnect(); // Ensure database connection

    // Find users, sort by rating descending, limit results, select specific fields
    const users = await User.find({}) // Find all users (no specific filter needed here)
      .sort({ rating: -1 })         // Sort by 'rating' field, -1 for descending
      .limit(LEADERBOARD_LIMIT)      // Limit the number of results
      .select('username rating wins losses -_id') // Select only these fields, exclude _id
      .lean(); // Use .lean() for performance boost (returns plain JS objects)

    // Return the sorted user data
    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error("Leaderboard API Error:", error);
    // Return a generic error response
    return NextResponse.json(
      { message: 'Failed to fetch leaderboard data.', error: error.message },
      { status: 500 }
    );
  }
}