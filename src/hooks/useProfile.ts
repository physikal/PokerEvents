import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../types';
import { toPacificISOString } from '../utils/dateUtils';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          setProfile({ id: profileSnap.id, ...profileSnap.data() } as UserProfile);
        } else {
          // Create default profile
          const now = toPacificISOString(new Date());
          const defaultProfile = {
            email: user.email || '',
            displayName: user.displayName || '',
            timezone: 'America/Los_Angeles',
            createdAt: now,
            updatedAt: now,
          };

          await setDoc(profileRef, defaultProfile);
          setProfile({ id: user.uid, ...defaultProfile });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>) => {
    if (!user || !profile) return false;

    try {
      const profileRef = doc(db, 'users', user.uid);
      const updatedData = {
        ...updates,
        updatedAt: toPacificISOString(new Date())
      };

      // Ensure we're not sending undefined values
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined) {
          delete updatedData[key];
        }
      });

      await setDoc(profileRef, updatedData, { merge: true });
      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  return { profile, loading, updateProfile };
}