import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';

// Layouts & Security (Load immediately - needed for routing)
import PublicLayout from './components/layout/PublicLayout';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Lazy load all pages for better performance
const Home = lazy(() => import('./pages/public/Home'));
const JoinProgram = lazy(() => import('./pages/public/JoinProgram'));
const Login = lazy(() => import('./pages/public/Login'));
const Register = lazy(() => import('./pages/public/Register'));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword'));
const About = lazy(() => import('./pages/public/About'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Impact = lazy(() => import('./pages/public/Impact'));
const PublicPrograms = lazy(() => import('./pages/public/PublicPrograms'));
const PublicEvents = lazy(() => import('./pages/public/PublicEvents'));
const ProgramDetails = lazy(() => import('./pages/dashboard/ProgramDetails'));
const EventDetails = lazy(() => import('./pages/dashboard/EventDetails'));
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const ProgramsList = lazy(() => import('./pages/dashboard/ProgramsList'));
const Financials = lazy(() => import('./pages/dashboard/Financials'));
const EventsList = lazy(() => import('./pages/dashboard/EventsList'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserList = lazy(() => import('./pages/admin/UserList'));
const AdminPrograms = lazy(() => import('./pages/admin/AdminPrograms'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminBeneficiaries = lazy(() => import('./pages/admin/AdminBeneficiaries'));
const AdminImpact = lazy(() => import('./pages/admin/AdminImpact'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          
          {/* =========================================================
              1. PUBLIC "FRONT DOOR" ROUTES
             ========================================================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/join" element={<JoinProgram />} />
            
            {/* CORRECTED: Use the dedicated Public pages here */}
            <Route path="/public/programs" element={<PublicPrograms />} />
            <Route path="/public/events" element={<PublicEvents />} />

            {/* Details Pages (Shared) */}
            <Route path="/public/programs/:id" element={<ProgramDetails />} />
            <Route path="/public/events/:id" element={<EventDetails />} />
          </Route>

          {/* =========================================================
              2. AUTHENTICATION ROUTES
             ========================================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* =========================================================
              3. PROTECTED DASHBOARD ROUTES
             ========================================================= */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MainLayout />}>
              <Route index element={<Overview />} />
              <Route path="overview" element={<Overview />} />
              <Route path="programs" element={<ProgramsList />} />
              <Route path="programs/:id" element={<ProgramDetails />} />
              <Route path="financials" element={<Financials />} />
              <Route path="events" element={<EventsList />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="impact" element={<Impact isDashboard={true} />} />
              <Route path="profile" element={<Profile />} />
            </Route> 

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<MainLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserList />} />
                <Route path="programs" element={<AdminPrograms />} /> 
                <Route path="events" element={<AdminEvents />} />
                <Route path="beneficiaries" element={<AdminBeneficiaries />} />
                <Route path="impact" element={<AdminImpact />}   />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;