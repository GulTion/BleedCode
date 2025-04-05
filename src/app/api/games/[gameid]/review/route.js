import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameState from '@/models/GameState';

export async function GET(request, { params }) {
  const { gameid } =await params;
//   const { searchParams } = new URL(request.url);
//   const username = searchParams.get('username');

//   if (!username) {
//     return NextResponse.json({ 
//       success: false, 
//       error: 'Username is required' 
//     }, { status: 400 });
//   }

  try {
    await dbConnect(); // Ensure database connection
    const gameState = await GameState.findOne({ 
      gameId: gameid,
    //   username: username 
    }).sort({ createdAt: -1 }); // Get the most recent state for this user

    if (!gameState) {
      return NextResponse.json({
        success: false,
        error: 'Game state not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: gameState
    });

  } catch (error) {
    console.error('Error fetching GameState:', error); // Log detailed error
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { gameid } = await params;
  
  try {
    await dbConnect(); // Ensure database connection
    const body = await request.json();
    
    if (!body.username) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username is required' 
      }, { status: 400 });
    }

    const gameState = new GameState({
      gameId: gameid,
      username: body.username,
      digits: body.digits,
      state: body.state
    });

    await gameState.save();

    return NextResponse.json({
      success: true,
      data: gameState
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error saving GameState:', error); // Log detailed error
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
