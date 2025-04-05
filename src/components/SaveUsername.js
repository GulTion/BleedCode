'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const SaveUsername = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.username) {
      localStorage.setItem('username', session.user.username);
    }
  }, [session?.user?.username]);

  return null; // This component doesn't render anything
};

export default SaveUsername;
