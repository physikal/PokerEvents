import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RequireProfile from './components/RequireProfile';
import RequireVerification from './components/RequireVerification';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Contact from './pages/Contact';
import VerifyEmail from './pages/VerifyEmail';
import TournamentTimer from './pages/TournamentTimer';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-poker-black">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/timer" element={<TournamentTimer />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <RequireVerification>
                    <RequireProfile>
                      <Dashboard />
                    </RequireProfile>
                  </RequireVerification>
                </PrivateRoute>
              } />
              <Route path="/history" element={
                <PrivateRoute>
                  <RequireVerification>
                    <RequireProfile>
                      <History />
                    </RequireProfile>
                  </RequireVerification>
                </PrivateRoute>
              } />
              <Route path="/groups" element={
                <PrivateRoute>
                  <RequireVerification>
                    <RequireProfile>
                      <Groups />
                    </RequireProfile>
                  </RequireVerification>
                </PrivateRoute>
              } />
              <Route path="/groups/:id" element={
                <PrivateRoute>
                  <RequireVerification>
                    <RequireProfile>
                      <GroupDetails />
                    </RequireProfile>
                  </RequireVerification>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <RequireVerification>
                    <Profile />
                  </RequireVerification>
                </PrivateRoute>
              } />
              <Route path="/create-event" element={
                <PrivateRoute>
                  <RequireVerification>
                    <RequireProfile>
                      <CreateEvent />
                    </RequireProfile>
                  </RequireVerification>
                </PrivateRoute>
              } />
              <Route path="/event/:id" element={
                <PrivateRoute>
                  <RequireVerification>
                    <RequireProfile>
                      <EventDetails />
                    </RequireProfile>
                  </RequireVerification>
                </PrivateRoute>
              } />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;