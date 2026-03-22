import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import { SimulationProvider } from './context/SimulationContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SimulationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
            
              <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="live-tracking" element={<LiveTracking />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </SimulationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
