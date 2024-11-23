import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-poker-black">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
              <Route path="/create-event" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
              <Route path="/event/:id" element={<PrivateRoute><EventDetails /></PrivateRoute>} />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;