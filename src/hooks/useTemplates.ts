import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { TournamentTemplate } from '../types/tournament';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { toast } from 'react-hot-toast';

export function useTemplates() {
  const [customTemplates, setCustomTemplates] = useState<TournamentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const templatesRef = collection(db, 'tournamentTemplates');
    const q = query(templatesRef, where('ownerId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const templates = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        } as TournamentTemplate));
        setCustomTemplates(templates);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load tournament templates');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const saveTemplate = async (template: TournamentTemplate) => {
    if (!user) return;

    try {
      const templateData = {
        ...template,
        ownerId: user.uid,
        updatedAt: new Date().toISOString()
      };

      if (template.id.startsWith('custom-')) {
        // New template
        await addDoc(collection(db, 'tournamentTemplates'), {
          ...templateData,
          createdAt: new Date().toISOString()
        });
        toast.success('Template saved successfully');
      } else {
        // Update existing template
        const templateRef = doc(db, 'tournamentTemplates', template.id);
        await updateDoc(templateRef, templateData);
        toast.success('Template updated successfully');
      }
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Failed to save template');
      throw error;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!user) return;

    try {
      const templateRef = doc(db, 'tournamentTemplates', templateId);
      await deleteDoc(templateRef);
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Delete template error:', error);
      toast.error('Failed to delete template');
      throw error;
    }
  };

  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];

  return {
    templates: allTemplates,
    customTemplates,
    saveTemplate,
    deleteTemplate,
    loading
  };
}