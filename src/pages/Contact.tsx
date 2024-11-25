import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG } from '../config/email';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    try {
      await emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        EMAIL_CONFIG.TEMPLATES.CONTACT_FORM,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: 'support@suckingout.com',
          reply_to: formData.email
        }
      );

      toast.success('Message sent successfully!');
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
      setSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="card">
          <div className="flex items-center gap-3 mb-8">
            <Mail className="w-8 h-8 text-poker-red" />
            <h1 className="text-3xl font-bold">Contact Us</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-poker-red">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input w-full"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-poker-red">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input w-full"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Subject <span className="text-poker-red">*</span>
              </label>
              <input
                type="text"
                name="subject"
                className="input w-full"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Message <span className="text-poker-red">*</span>
              </label>
              <textarea
                name="message"
                rows={6}
                className="input w-full resize-none"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={sending}
              >
                <Send size={18} />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}