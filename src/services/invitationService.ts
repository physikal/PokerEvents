import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';

export class InvitationService {
  static validateUser(user: User | null): { uid: string; email: string } {
    if (!user) {
      throw new Error('You must be logged in to perform this action');
    }
    if (!user.email) {
      throw new Error('Your account must have an email address');
    }
    return { uid: user.uid, email: user.email };
  }

  static async acceptEventInvite(eventId: string, user: User | null) {
    const { uid, email } = this.validateUser(user);
    const eventRef = doc(db, 'events', eventId);
    
    await updateDoc(eventRef, {
      currentPlayers: arrayUnion(uid),
      invitedPlayers: arrayRemove(email)
    });
  }

  static async declineEventInvite(eventId: string, user: User | null) {
    const { email } = this.validateUser(user);
    const eventRef = doc(db, 'events', eventId);
    
    await updateDoc(eventRef, {
      invitedPlayers: arrayRemove(email)
    });
  }

  static async acceptGroupInvite(groupId: string, user: User | null) {
    const { uid, email } = this.validateUser(user);
    const groupRef = doc(db, 'groups', groupId);
    
    await updateDoc(groupRef, {
      members: arrayUnion(uid),
      invitedMembers: arrayRemove(email)
    });
  }

  static async declineGroupInvite(groupId: string, user: User | null) {
    const { email } = this.validateUser(user);
    const groupRef = doc(db, 'groups', groupId);
    
    await updateDoc(groupRef, {
      invitedMembers: arrayRemove(email)
    });
  }
}