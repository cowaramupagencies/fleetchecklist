import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

/** Matches Vite `base` (import.meta.env.BASE_URL) for subpath deploys. */
function routerBasename() {
  const b = import.meta.env.BASE_URL;
  if (b === '/') return undefined;
  return b.endsWith('/') ? b.slice(0, -1) : b;
}
import { AuthProvider } from './context/AuthProvider.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { AuthPage } from './pages/Auth.jsx';
import { HomePage } from './pages/Home.jsx';
import { AddVehiclePage } from './pages/AddVehicle.jsx';
import { VehicleDetailPage } from './pages/VehicleDetail.jsx';
import { VehicleEditPage } from './pages/VehicleEdit.jsx';
import { ChecklistPage } from './pages/Checklist.jsx';
import { HistoryPage } from './pages/History.jsx';
import { RecordDetailPage } from './pages/RecordDetail.jsx';
import { SettingsPage } from './pages/Settings.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={routerBasename()}>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/new"
            element={
              <ProtectedRoute>
                <AddVehiclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id/edit"
            element={
              <ProtectedRoute>
                <VehicleEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id/checklist"
            element={
              <ProtectedRoute>
                <ChecklistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicles/:id"
            element={
              <ProtectedRoute>
                <VehicleDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:id"
            element={
              <ProtectedRoute>
                <RecordDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
