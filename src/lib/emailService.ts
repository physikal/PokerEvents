import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init('ESqYejjB3y34cO3rL');

interface EmailTemplate {
  to_email: string;
  event_title: string;
  event_date: string;
  event_location: string;
  event_buyin: number;
  event_link: string;
  reply_to: string;
}

export const sendInvitationEmail = async (templateParams: EmailTemplate) => {
  try {
    const response = await emailjs.send(
      'service_4rpie4o',
      'template_g5fi4ts',
      templateParams
    );
    return response;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};