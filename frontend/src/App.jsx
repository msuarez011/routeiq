import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home      from './pages/Home';
import Results   from './pages/Results';
import Auth      from './pages/Auth';
import Favorites from './pages/Favorites';
import Profile   from './pages/Profile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/auth" replace />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/results"   element={<Results />} />
        <Route path="/auth"      element={<Auth />} />
        <Route path="/favorites" element={
          <PrivateRoute><Favorites /></PrivateRoute>
        } />
        <Route path="/profile"   element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
      </Routes>
    </div>
  );
}