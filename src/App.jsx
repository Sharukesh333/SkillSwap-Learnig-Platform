import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import CourseDetail from './pages/CourseDetail';
import BookSession from './pages/BookSession';
import MySessions from './pages/MySessions';
import Assessment from './pages/Assessment';
import Teach from './pages/Teach';
import TeachSlots from './pages/TeachSlots';
import TeachSettings from './pages/TeachSettings';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import LiveSession from './pages/LiveSession';
import ProfileSetup from './pages/ProfileSetup';
import LoginSim from './pages/LoginSim';
import SessionComplete from './pages/SessionComplete';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show login page for local development
      return <LoginSim />;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/book/:courseId" element={<BookSession />} />
        <Route path="/my-sessions" element={<MySessions />} />
        <Route path="/assessment/:type/:courseId" element={<Assessment />} />
        <Route path="/teach" element={<Teach />} />
        <Route path="/teach/slots/:courseId" element={<TeachSlots />} />
        <Route path="/teach/settings/:courseId" element={<TeachSettings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/live/:sessionId" element={<LiveSession />} />
        <Route path="/session-complete/:courseId" element={<SessionComplete />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/login-sim" element={<LoginSim />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
