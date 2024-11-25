import { Link } from 'react-router-dom';
import { ArrowRight, Users, Calendar, Trophy, ChevronRight, Mail } from 'lucide-react';

const features = [
  {
    title: 'Event Management',
    description: 'Create and manage poker events with ease. Set buy-ins, player limits, and track attendance.',
    image: 'https://firebasestorage.googleapis.com/v0/b/pokerevents-3639d.firebasestorage.app/o/EventManagement.png?alt=media&token=e775e39e-ce6a-4346-b93a-12a3822a59b1'
  },
  {
    title: 'Group Organization',
    description: 'Create groups for regular players, track statistics, and maintain leaderboards.',
    image: 'https://firebasestorage.googleapis.com/v0/b/pokerevents-3639d.firebasestorage.app/o/GroupDetails.png?alt=media&token=780556d3-3016-4fdc-bccc-09367607b78d'
  },
  {
    title: 'Event History',
    description: 'Keep track of past events, winners, and payouts with detailed history tracking.',
    image: 'https://firebasestorage.googleapis.com/v0/b/pokerevents-3639d.firebasestorage.app/o/EventHistory.png?alt=media&token=04fbd1a2-2df3-4ef5-b649-cf8b58f45a5f'
  }
];

const highlights = [
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Group Management',
    description: 'Create and manage poker groups, invite players, and track group statistics.'
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Event Planning',
    description: 'Schedule events, set buy-ins, and manage player registrations with ease.'
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Winner Tracking',
    description: 'Record winners, track payouts, and maintain historical records of all events.'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-poker-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-poker-red/20 to-transparent" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Organize Your Poker Nights Like a Pro
            </h1>
            <p className="text-xl text-gray-300">
              The ultimate platform for managing poker events, tracking games, and connecting with players.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 md:py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Everything You Need to Run Poker Events
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="card p-6">
                <div className="text-poker-red mb-4">{highlight.icon}</div>
                <h3 className="text-xl font-bold mb-2">{highlight.title}</h3>
                <p className="text-gray-400">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screenshot Showcase */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-8 items-center`}
              >
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-lg mb-6">
                    {feature.description}
                  </p>
                  <Link
                    to="/register"
                    className="text-poker-red hover:text-red-400 font-semibold flex items-center gap-2"
                  >
                    Get Started
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex-1">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="rounded-lg shadow-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-gradient-to-br from-poker-red to-red-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Elevate Your Poker Nights?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join now and start organizing professional-level poker events with your friends.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary bg-white text-poker-red hover:bg-gray-100 text-lg px-8 py-3 inline-flex items-center gap-2"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}