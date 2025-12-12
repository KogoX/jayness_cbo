import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Public Pages & Layouts
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/public/Home';
import JoinProgram from './pages/public/JoinProgram';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import About from './pages/public/About'; 
import Contact from './pages/public/Contact';
import Impact from './pages/public/Impact';

// NEW: Specialized Public List Pages
import PublicPrograms from './pages/public/PublicPrograms';
import PublicEvents from './pages/public/PublicEvents';    

// Shared Details Pages (Smart components that handle both public/private)
import ProgramDetails from './pages/dashboard/ProgramDetails';
import EventDetails from './pages/dashboard/EventDetails';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';
import ProgramsList from './pages/dashboard/ProgramsList'; 
import Financials from './pages/dashboard/Financials';
import EventsList from './pages/dashboard/EventsList';
import Profile from './pages/dashboard/Profile';     

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserList from './pages/admin/UserList';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBeneficiaries from './pages/admin/AdminBeneficiaries';
import AdminImpact from './pages/admin/AdminImpact';
import AdminNotifications from './pages/admin/AdminNotifications';


// Layouts & Security
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
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
            <Route path="impact" element={<Impact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="impact" element={<Impact isDashboard={true} />} />
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
    </Router>
  );
}

export default App;