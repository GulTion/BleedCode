// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // Adjust path if your lib folder is elsewhere
import User from '@/models/User';       // Adjust path if your models folder is elsewhere

export async function GET(request) {
  try {
    await dbConnect(); // Ensure database connection is established

    // Fetch users from your DB
    const users = await User.find({}); // Find all users

    return NextResponse.json({ success: true, data: users }, { status: 200 });

  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect(); // Ensure database connection is established

    // Parse the request body
    const body = await request.json();

    // Basic validation (Mongoose schema handles more)
    if (!body.name) {
        return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    // Insert new user into your DB using the Mongoose model
    const newUser = await User.create({ name: body.name }); // Create a new user document

    return NextResponse.json({ success: true, data: newUser }, { status: 201 }); // Return the created user

  } catch (error) {
    console.error("POST /api/users error:", error);
    // Handle potential Mongoose validation errors
    if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return NextResponse.json({ success: false, errors: errors }, { status: 400 });
    }
    // Handle other errors (e.g., duplicate key if you add unique fields)
    if (error.code === 11000) { // Duplicate key error code
       return NextResponse.json({ success: false, error: 'Duplicate field value entered.' }, { status: 400 });
    }
    // Generic server error
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}