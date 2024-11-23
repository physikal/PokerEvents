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

interface CancellationTemplate {
  to_emails: string[];
  event_title: string;
  event_date: string;
  event_location: string;
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

export const sendCancellationEmails = async (params: CancellationTemplate) => {
  try {
    // Send emails to all participants and invited players
    const emailPromises = params.to_emails.map(email => 
      emailjs.send(
        'service_4rpie4o',
        'template_25uo227',
        {
          to_email: email,
          event_title: params.event_title,
          event_date: params.event_date,
          event_location: params.event_location,
          reply_to: 'noreply@suckingout.com'
        }
      )
    );

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Failed to send cancellation emails:', error);
    throw error;
  }
};