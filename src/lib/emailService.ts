import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/email';

// Initialize EmailJS with public key
emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

interface EmailTemplate {
  to_email: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_buyin: number;
  event_link: string;
  reply_to: string;
}

interface GroupInviteTemplate {
  to_email: string;
  group_name: string;
  inviter_name: string;
  group_link: string;
  reply_to: string;
}

interface CancellationTemplate {
  to_emails: string[];
  event_title: string;
  event_date: string;
  event_location: string;
}

export const sendInvitationEmail = async (templateParams: EmailTemplate) => {
  try {
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATES.EVENT_INVITE,
      {
        ...templateParams,
        app_name: 'Poker Nights',
        subject: `You're invited to ${templateParams.event_title}`,
      }
    );
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendGroupInvitation = async (templateParams: GroupInviteTemplate) => {
  try {
    const response = await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATES.GROUP_INVITE,
      {
        ...templateParams,
        app_name: 'Poker Nights',
        subject: `${templateParams.inviter_name} invited you to join ${templateParams.group_name}`,
      }
    );
    return response;
  } catch (error) {
    console.error('Group invitation email failed:', error);
    throw error;
  }
};

export const sendCancellationEmails = async (params: CancellationTemplate) => {
  try {
    // Send emails to all participants and invited players
    const emailPromises = params.to_emails.map(email => 
      emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATES.EVENT_CANCEL,
        {
          to_email: email,
          event_title: params.event_title,
          event_date: params.event_date,
          event_location: params.event_location,
          reply_to: 'noreply@suckingout.com',
          app_name: 'Poker Nights',
          subject: `${params.event_title} has been cancelled`,
        }
      )
    );

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Failed to send cancellation emails:', error);
    throw error;
  }
};