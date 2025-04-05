// src/app/api/games/[gameid]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Game from '@/models/Game';

// Handler for GET /api/games/:gameid
export async function GET(request, { params }) {
  // Extract the gameid from the dynamic route parameters
  const { gameid } = params;

  // Basic validation for the presence of the gameid parameter
  if (!gameid) {
    return NextResponse.json(
        { success: false, error: 'Game ID parameter is missing' },
        { status: 400 } // Bad Request
    );
  }

  try {
    await dbConnect(); // Ensure database connection

    // Find the game by the custom 'gameid' field
    const game = await Game.findOne({ gameid: gameid });

    // If no game is found with that gameid
    if (!game) {
      return NextResponse.json(
          { success: false, error: 'Game not found' },
          { status: 404 } // Not Found
      );
    }

    // If game is found, return its details
    return NextResponse.json(
        { success: true, data: game },
        { status: 200 } // OK
    );

  } catch (error) {
    console.error(`GET /api/games/${gameid} error:`, error);

    // Handle potential errors during database query
    if (error.name === 'CastError') { // Less likely for string ID but possible
        return NextResponse.json(
            { success: false, error: 'Invalid Game ID format or Game not found' },
            { status: 404 }
        );
    }

    // Generic server error for other issues
    return NextResponse.json(
        { success: false, error: 'Server Error fetching game details' },
        { status: 500 }
    );
  }
}

// You can add PATCH/PUT/DELETE handlers to this file later
// if you want to update or delete a specific game by its ID.
// export async function PATCH(request, { params }) { ... }
// export async function DELETE(request, { params }) { ... }