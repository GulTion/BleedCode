// src/app/api/auth/signout/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Since there's no session token or cookie managed by the server in this setup,
  // this endpoint doesn't need to perform any server-side action
  // like clearing a cookie or invalidating a token.

  // It simply acknowledges the client's request to sign out.
  // The client-side application is responsible for clearing any
  // locally stored user information or state upon receiving this success response.

  return NextResponse.json(
    { success: true, message: 'Signout acknowledged. Client should clear session state.' },
    { status: 200 }
  );
}