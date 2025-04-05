// src/app/api/auth/signin/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    // Allow signin with either username or email
    const { identifier, password } = body; // 'identifier' can be username or email

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide username/email and password' },
        { status: 400 }
      );
    }

    // --- Find User ---
    // IMPORTANT: Select the password field for comparison!
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password'); // Explicitly include password

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' }, // Generic error
        { status: 401 } // Unauthorized
      );
    }

    // --- Compare Passwords ---
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' }, // Generic error
        { status: 401 } // Unauthorized
      );
    }

    // --- Prepare Response (Exclude Password) ---
     const userResponseData = { ...user.toObject() };
     delete userResponseData.password;

    // --- Send Success Response ---
    // NOTE: This response only confirms credentials are valid *for this request*.
    // It does NOT establish a persistent session.
    return NextResponse.json(
        { success: true, message: "Credentials verified successfully", user: userResponseData },
        { status: 200 }
    );

  } catch (error) {
    console.error("POST /api/auth/signin error:", error);
    return NextResponse.json({ success: false, error: 'Server Error during signin' }, { status: 500 });
  }
}