import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/email';

// Initialize EmailJS with public key
emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_REQUESTS: 3, // Maximum requests per interval
  INTERVAL: 1000, // Time interval in milliseconds
  RETRY_DELAY: 2000, // Delay between retries in milliseconds
  MAX_RETRIES: 3 // Maximum number of retry attempts
};

// Queue for tracking email requests
let emailQueue: number[] = [];

// Check if we're within rate limits
const checkRateLimit = (): boolean => {
  const now = Date.now();
  // Remove timestamps older than the interval
  emailQueue = emailQueue.filter(timestamp => now - timestamp < RATE_LIMIT.INTERVAL);
  
  return emailQueue.length < RATE_LIMIT.MAX_REQUESTS;
};

// Add request to queue
const trackRequest = () => {
  emailQueue.push(Date.now());
};

// Sleep function for delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Send email with retry logic and rate limiting
const sendEmailWithRetry = async (
  templateId: string,
  templateParams: Record<string, any>,
  retryCount = 0
): Promise<any> => {
  try {
    if (!checkRateLimit()) {
      if (retryCount >= RATE_LIMIT.MAX_RETRIES) {
        throw new Error('Max retries exceeded');
      }
      await sleep(RATE_LIMIT.RETRY_DELAY);
      return sendEmailWithRetry(templateId, templateParams, retryCount + 1);
    }

    trackRequest();
    return await emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      templateId,
      {
        ...templateParams,
        app_name: 'Poker Nights',
        from_name: 'Poker Nights'
      }
    );
  } catch (error: any) {
    if (error?.status === 429 && retryCount < RATE_LIMIT.MAX_RETRIES) {
      await sleep(RATE_LIMIT.RETRY_DELAY);
      return sendEmailWithRetry(templateId, templateParams, retryCount + 1);
    }
    throw error;
  }
};

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
    return await sendEmailWithRetry(
      EMAIL_CONFIG.TEMPLATES.EVENT_INVITE,
      {
        ...templateParams,
        subject: `You're invited to ${templateParams.event_title}`
      }
    );
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendGroupInvitation = async (templateParams: GroupInviteTemplate) => {
  try {
    return await sendEmailWithRetry(
      EMAIL_CONFIG.TEMPLATES.GROUP_INVITE,
      {
        ...templateParams,
        subject: `${templateParams.inviter_name} invited you to join ${templateParams.group_name}`
      }
    );
  } catch (error) {
    console.error('Group invitation email failed:', error);
    throw error;
  }
};

export const sendCancellationEmails = async (params: CancellationTemplate) => {
  try {
    // Send emails to all participants and invited players with rate limiting
    for (const email of params.to_emails) {
      try {
        await sendEmailWithRetry(
          EMAIL_CONFIG.TEMPLATES.EVENT_CANCEL,
          {
            to_email: email,
            event_title: params.event_title,
            event_date: params.event_date,
            event_location: params.event_location,
            subject: `${params.event_title} has been cancelled`,
            reply_to: 'noreply@suckingout.com'
          }
        );
      } catch (error) {
        console.error(`Failed to send cancellation email to ${email}:`, error);
        // Continue with other emails even if one fails
      }
    }
  } catch (error) {
    console.error('Failed to send cancellation emails:', error);
    throw error;
  }
};