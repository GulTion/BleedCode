import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials'; // Import if you use credentials too
import dbConnect from '@/lib/dbConnect'; // Adjust path as needed
import User from '@/models/User'; // Adjust path as needed
import bcrypt from 'bcryptjs'; // Import if using credentials with hashing
import crypto from 'crypto'; // To generate secure random passwords for SSO users

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // Add CredentialsProvider if you have username/password login
    // CredentialsProvider({
    //   name: 'Credentials',
    //   credentials: {
    //     username: { label: "Username", type: "text" },
    //     password: { label: "Password", type: "password" }
    //   },
    //   async authorize(credentials) {
    //     await dbConnect();
    //     try {
    //       const user = await User.findOne({ username: credentials.username });
    //       if (user && user.authProvider === 'credentials') {
    //         const isValid = await bcrypt.compare(credentials.password, user.password);
    //         if (isValid) {
    //           // Return essential user info, DO NOT return password
    //           return { id: user._id, name: user.name, email: user.email, username: user.username };
    //         }
    //       }
    //     } catch (err) {
    //       console.error("Authorize error:", err);
    //       return null;
    //     }
    //     return null; // Login failed
    //   }
    // })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();
      // console.log("signIn Callback:", { user, account, profile }); // Debugging

      if (account.provider === 'google') {
        try {
          const existingUser = await User.findOne({ email: profile.email });

          if (existingUser) {
            // Optional: Update user info if needed (e.g., name, image)
            // if (existingUser.authProvider !== 'google') {
            //   // Handle account linking or error if email exists with different provider
            //   console.log("Email already exists with different provider");
            //   return false; // Prevent sign-in
            // }
            // Update image if changed
            if (profile.picture && existingUser.image !== profile.picture) {
              existingUser.image = profile.picture;
              await existingUser.save();
            }
            // console.log("Google user exists:", existingUser);
            user.id = existingUser._id.toString(); // Add db id to user object for jwt callback
            user.username = existingUser.username; // Add username for jwt callback
            user.image = existingUser.image; // Add image for jwt callback
            return true; // Allow sign-in
          } else {
            // Create new user for Google sign-in
            // Generate a unique username (e.g., from email, handle potential collisions)
            let baseUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            let uniqueUsername = baseUsername;
            let counter = 1;
            while (await User.findOne({ username: uniqueUsername })) {
              uniqueUsername = `${baseUsername}${counter}`;
              counter++;
            }

            // Generate a secure random password as placeholder (won't be used for login)
            const randomPassword = crypto.randomBytes(16).toString('hex');
            // Hash the random password if your pre-save hook expects it
            // const hashedPassword = await bcrypt.hash(randomPassword, 10); // Use bcrypt if hashing

            const newUser = new User({
              email: profile.email,
              name: profile.name,
              username: uniqueUsername,
              image: profile.picture,
              emailVerified: new Date(), // Google provides verified email
              authProvider: 'google',
              // Use the hashed random password if required by schema/hooks
              // password: hashedPassword,
              password: randomPassword, // Store plain random if not hashing SSO passwords
              // Set default values for other required fields if necessary
              // rating: 1500, // Example
              // coins: 100, // Example
            });

            await newUser.save();
            // console.log("New Google user created:", newUser);
            user.id = newUser._id.toString(); // Add db id to user object for jwt callback
            user.username = newUser.username; // Add username for jwt callback
            user.image = newUser.image; // Add image for jwt callback
            return true; // Allow sign-in
          }
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false; // Prevent sign-in on error
        }
      }
      // Handle other providers (like credentials) if necessary
      // if (account.provider === 'credentials') {
      //    // User object here comes from the authorize function
      //    return !!user; // Allow sign in if authorize returned a user
      // }

      return true; // Default allow sign-in for other cases or if only Google is used
    },

    async jwt({ token, user, account, profile }) {
      // console.log("JWT Callback:", { token, user, account, profile }); // Debugging
      // Persist the user id, username, and image to the token
      if (user) { // User object is available on initial sign-in
        token.id = user.id; // user.id was added in signIn callback
        token.username = user.username; // user.username was added in signIn callback
        token.picture = user.image; // Persist image from user object
      }
      // You could also fetch fresh data from DB here if needed on subsequent requests
      // Example:
      // if (!token.username && token.id) {
      //   await dbConnect();
      //   const dbUser = await User.findById(token.id).select('username rating');
      //   if (dbUser) {
      //     token.username = dbUser.username;
      //     token.rating = dbUser.rating; // Add other fields as needed
      //   }
      // }
      return token;
    },

    async session({ session, token }) {
      // console.log("Session Callback:", { session, token }); // Debugging
      // Send properties to the client, like database user id, username, and image
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        // localStorage.setItem("username", token.username);
        session.user.image = token.picture; // Add image URL to session user object
        // Add any other properties from the token to the session user object
        // session.user.rating = token.rating;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt', // Using JWT strategy is common, especially with database lookups
  },
  pages: {
    signIn: '/', // Your sign-in page
    // error: '/auth/error', // Optional: Custom error page
  },
  // secret: process.env.NEXTAUTH_SECRET, // Ensure NEXTAUTH_SECRET is set in .env
  // debug: process.env.NODE_ENV === 'development', // Optional: Enable debug logs in dev
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };