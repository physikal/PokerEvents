import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PokerEvent } from '../types';
import { toast } from 'react-hot-toast';
import { formatToPacific } from '../utils/dateUtils';
import { sendCancellationEmails } from '../lib/emailService';

export class EventService {
  static async joinEvent(eventId: string, userId: string, userEmail: string) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        currentPlayers: arrayUnion(userId),
        invitedPlayers: arrayRemove(userEmail)
      });
      return true;
    } catch (error) {
      console.error('Join event error:', error);
      throw error;
    }
  }

  static async leaveEvent(eventId: string, userId: string) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        currentPlayers: arrayRemove(userId)
      });
      return true;
    } catch (error) {
      console.error('Leave event error:', error);
      throw error;
    }
  }

  static async removeInvite(eventId: string, email: string) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        invitedPlayers: arrayRemove(email)
      });
      return true;
    } catch (error) {
      console.error('Remove invite error:', error);
      throw error;
    }
  }

  static async setWinners(eventId: string, winners: PokerEvent['winners']) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        winners,
        status: 'completed'
      });
      return true;
    } catch (error) {
      console.error('Set winners error:', error);
      throw error;
    }
  }

  static async cancelEvent(event: PokerEvent, participantEmails: string[]) {
    try {
      const allEmails = [...participantEmails, ...event.invitedPlayers];

      await sendCancellationEmails({
        to_emails: allEmails,
        event_title: event.title,
        event_date: formatToPacific(event.date),
        event_location: event.location
      });

      await deleteDoc(doc(db, 'events', event.id));
      return true;
    } catch (error) {
      console.error('Cancel event error:', error);
      throw error;
    }
  }
}