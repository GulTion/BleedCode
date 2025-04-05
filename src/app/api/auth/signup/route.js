// src/app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, username, email, password } = body;

    // --- Basic Input Validation ---
    if (!name || !username || !email || !password) {
        let missing = [];
        if (!name) missing.push('name');
        if (!username) missing.push('username');
        if (!email) missing.push('email');
        if (!password) missing.push('password');
        return NextResponse.json(
            { success: false, error: `Missing required fields: ${missing.join(', ')}` },
            { status: 400 }
        );
    }

    // --- Check if user already exists ---
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        let field = existingUser.email === email ? 'email' : 'username';
        return NextResponse.json(
            { success: false, error: `This ${field} is already taken.` },
            { status: 409 } // Conflict
        );
    }

    // --- Password Hashing ---
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Create User Document ---
    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // --- Prepare Response Data (Exclude Password) ---
    const userResponseData = { ...newUser.toObject() };
    delete userResponseData.password;

    // --- Send Success Response ---
    return NextResponse.json(
      { success: true, message: "User registered successfully", data: userResponseData },
      { status: 201 }
    );

  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    // Keep the detailed error handling (ValidationError, code 11000)
     if (error.name === 'ValidationError') {
      let errors = {};
      Object.keys(error.errors).forEach((key) => { errors[key] = error.errors[key].message; });
      if (error.errors.username && error.errors.username.kind === 'unique') errors.username = 'This username is already taken.';
      if (error.errors.email && error.errors.email.kind === 'unique') errors.email = 'This email is already registered.';
      return NextResponse.json({ success: false, errors: errors }, { status: 400 });
     }
     if (error.code === 11000) {
       let field = Object.keys(error.keyValue)[0];
       let message = `This ${field} is already taken.`;
       if (field === 'email') message = 'This email is already registered.';
       return NextResponse.json({ success: false, error: message, field: field }, { status: 400 });
     }
    return NextResponse.json({ success: false, error: 'Server Error during signup' }, { status: 500 });
  }
}