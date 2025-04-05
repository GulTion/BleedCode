import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import GameState from '@/models/GameState';

export async function GET(request, { params }) {
  const { gameid } = params; // Removed unnecessary 'await'
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ 
      success: false, 
      error: 'Username is required' 
    }, { status: 400 });
  }

  try {
    await dbConnect(); // Ensure database connection
    const gameState = await GameState.find({ 
      gameId: gameid,
      username: username 
    }).sort({ createdAt: -1 }).limit(1); // Changed 'findOne' to 'find' with sorting and limit

    if (!gameState.length) {
      return NextResponse.json({
        success: false,
        error: 'Game state not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: gameState[0] // Access the first result
    });

  } catch (error) {
    console.error('Error fetching GameState:', error); // Log detailed error
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while fetching the game state.' // Generic error message
    }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { gameid } = params; // Removed unnecessary 'await'
  
  try {
    await dbConnect(); // Ensure database connection
    const body = await request.json();
    
    if (!body.username) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username is required' 
      }, { status: 400 });
    }

    if (!body.digits || !body.state) {
      return NextResponse.json({
        success: false,
        error: 'Digits and state are required'
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
      error: 'An error occurred while saving the game state.' // Generic error message
    }, { status: 500 });
  }
}
