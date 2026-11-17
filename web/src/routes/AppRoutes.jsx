import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { OFFICER_ROLES, ROLES } from '../utils/constants.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import AdminPage from '../pages/AdminPage.jsx';
import DiagnosisPage from '../pages/DiagnosisPage.jsx';
import FarmDetailsPage from '../pages/FarmDetailsPage.jsx';
import FarmerDashboard from '../pages/FarmerDashboard.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import OfficerDashboard from '../pages/OfficerDashboard.jsx';
import PlantingPage from '../pages/PlantingPage.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import RecommendationsPage from '../pages/RecommendationsPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';

/** Officers land on the outbreak dashboard, everyone else on the farmer dashboard. */
function Home() {
  const { user } = useAuth();
  return OFFICER_ROLES.includes(user.role) ? <Navigate to="/officer" replace /> : <FarmerDashboard />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/farms/:id" element={<FarmDetailsPage />} />
          <Route path="/diagnosis" element={<DiagnosisPage />} />
          <Route path="/planting" element={<PlantingPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route element={<RoleRoute roles={OFFICER_ROLES} />}>
            <Route path="/officer" element={<OfficerDashboard />} />
          </Route>
          <Route element={<RoleRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
