// src/app/api/users/[username]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// Handler for GET /api/users/:username
export async function GET(request, { params }) {
  // The { params } object is automatically populated by Next.js
  // with the dynamic route segments.
  const { username } = params;

  if (!username) {
    return NextResponse.json(
        { success: false, error: 'Username parameter is missing' },
        { status: 400 }
    );
  }

  try {
    await dbConnect(); // Ensure database connection

    // Find the user by username, excluding the password
    const user = await User.findOne({ username: username }).select('-password');

    if (!user) {
      return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 } // Use 404 for Not Found
      );
    }

    // Return the found user data
    return NextResponse.json({ success: true, data: user }, { status: 200 });

  } catch (error) {
    console.error(`GET /api/users/${username} error:`, error);
    // Handle potential CastError if the format looks like an ID but isn't
    if (error.name === 'CastError') {
        return NextResponse.json(
            { success: false, error: 'Invalid username format or user not found' },
            { status: 404 }
        );
    }
    // Generic server error
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

// Note: You typically wouldn't have POST/PUT/DELETE handlers in this specific
// file unless you intend to perform actions specifically on /api/users/:username
// (like updating or deleting that specific user). User creation (POST) usually
// stays at the base /api/users route.