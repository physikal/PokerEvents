import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Location } from '../types';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const locationsRef = collection(db, 'locations');
    const q = query(
      locationsRef,
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const locationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as Location));
        
        // Sort by name
        locationsList.sort((a, b) => a.name.localeCompare(b.name));
        
        setLocations(locationsList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching locations:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { locations, loading };
}