import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key from environment variables
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

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
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_EVENT_TEMPLATE_ID,
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
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_GROUP_TEMPLATE_ID,
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
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_CANCEL_TEMPLATE_ID,
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