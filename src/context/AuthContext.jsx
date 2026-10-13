import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthContext } from './authContext.js';
import { auth } from '../firebase.js';
import { readUserProfile } from '../services/authService.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshProfile(authUser) {
    setUser(authUser);
    const nextProfile = await readUserProfile(authUser.uid);
    setProfile(nextProfile);
    return nextProfile;
  }

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await readUserProfile(authUser.uid);
        if (active) setProfile(userProfile);
      } catch {
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = { user, profile, role: profile?.role ?? null, loading, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
