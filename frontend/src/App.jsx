import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import Home from './pages/Home';
import OutfitBuilder from './pages/OutfitBuilder';
import SavedOutfits from './pages/SavedOutfits';
import AIStylist from './pages/AIStylist';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import { useContext } from 'react';
import { AuthContext } from './context/auth-context';
import { canAccessRoute, getDefaultRouteForRole } from './utils/roleUtils';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessRoute(user, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
};

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="page-wrapper min-h-screen flex flex-col">
      {user && <Navbar />}

      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/seller" element={
            <ProtectedRoute allowedRoles={['Seller']}>
              <SellerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/outfit-builder" element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <OutfitBuilder />
            </ProtectedRoute>
          } />

          <Route path="/saved-outfits" element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <SavedOutfits />
            </ProtectedRoute>
          } />

          <Route path="/ai-stylist" element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <AIStylist />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Catch All 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {user?.role === 'Customer' && <Footer />}
      <ScrollToTop />
    </div>
  );
}
