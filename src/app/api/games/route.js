// src/app/api/games/route.js
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid'; // Import nanoid
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect(); // Connect to DB

    const body = await request.json();
    const {
        username1,
        username2,
        seconds,
        initialState
    } = body;

    // --- Basic Input Validation (Keep as before) ---
    if (!username1 || !username2 || seconds === undefined || !initialState) {
      return NextResponse.json(
          { success: false, error: 'Missing required fields: username1, username2, seconds, initialState' },
          { status: 400 }
      );
    }
    if (username1 === username2) { /* ... */ }
    if (typeof seconds !== 'number' || seconds <= 0) { /* ... */ }


    // --- Fetch Player Data (Keep as before) ---
    const [user1, user2] = await Promise.all([
        User.findOne({ username: username1 }),
        User.findOne({ username: username2 })
    ]);
    if (!user1) { /* ... */ }
    if (!user2) { /* ... */ }

    console.log(user1)
    console.log(user2)

    // --- Generate Custom Game ID ---
    const generatedGameId = nanoid(10); // Generate a 10-character unique ID

    // --- Create New Game Document ---
    const newGame = await Game.create({
        gameid: generatedGameId, // Include the generated gameid here
        username1: user1.username,
        username2: user2.username,
        user1rating: user1.rating,
        user2rating: user2.rating,
        seconds: seconds,
        user1states: initialState,
        user2states: initialState,
        // Defaults for winnerusername, timestamps, createdAt will still apply
    });

    // --- Send Success Response (Keep as before) ---
    return NextResponse.json({ success: true, data: newGame }, { status: 201 });

  } catch (error) {
    console.error("POST /api/games error:", error);

    // --- Error Handling (Keep as before, including ValidationError check) ---
    if (error.name === 'ValidationError') {
       // Check specifically if it's a unique constraint violation for gameid (unlikely with nanoid but good practice)
       if (error.errors?.gameid?.kind === 'unique') {
           return NextResponse.json({ success: false, error: 'Failed to generate a unique game ID, please try again.' }, { status: 500 });
       }
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return NextResponse.json({ success: false, errors: errors }, { status: 400 });
    }
     if (error.name === 'CastError') { /* ... */ }

    // Handle potential unique constraint violation if nanoid somehow collides (extremely rare)
     if (error.code === 11000 && error.keyPattern?.gameid) {
         console.error("Game ID collision (rare):", error);
          return NextResponse.json({ success: false, error: 'Failed to generate a unique game ID, please try again.' }, { status: 500 });
     }

    // Generic server error
    return NextResponse.json({ success: false, error: 'Server Error creating game' }, { status: 500 });
  }
}



// ... (keep any GET handlers if you have them) ...
export async function GET(request) {
  try {
    // 1. Get username from query parameters
    // The 'request' object contains URL details
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username'); // Get 'username' query param

    // 2. Validate input: Check if username parameter is provided
    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameter: username' },
        { status: 400 } // Bad Request
      );
    }

    // 3. Connect to DB
    await dbConnect();

    // 4. Query the database for games involving the user
    // Find games where the username matches either player1 or player2
    const games = await Game.find({
      $or: [                     // Use the $or operator
        { username1: username }, // Check if user is player 1
        { username2: username }  // Check if user is player 2
      ]
    }).sort({ createdAt: -1 }); // Optional: Sort by newest games first

    // 5. Return the results
    // It's good practice to indicate if no games were found, even if it's an empty array
    return NextResponse.json(
        { success: true, count: games.length, data: games }, // Include count for clarity
        { status: 200 } // OK
    );

  } catch (error) {
    // 6. Handle potential errors
    console.error("GET /api/games?username=... error:", error);
    return NextResponse.json(
        { success: false, error: 'Server Error fetching games for user' },
        { status: 500 } // Internal Server Error
    );
  }
}