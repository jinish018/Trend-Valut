import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Highlights from './pages/Highlights';
import AllCoins from './pages/AllCoins';
import Portfolio from './pages/Portfolio';
import Collections from './pages/Collections';
import CoinDetails from './pages/CoinDetails';
import Profile from './pages/Profile';
import Predictor from './pages/Predictor';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();

  if (loading || !initialized) {
    return <LoadingSpinner message="Loading..." />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();

  if (loading || !initialized) {
    return <LoadingSpinner message="Loading..." />;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <ErrorBoundary>
                  <Login />
                </ErrorBoundary>
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <ErrorBoundary>
                  <Register />
                </ErrorBoundary>
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <Dashboard />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/highlights" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <Highlights />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/all" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <AllCoins />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <Portfolio />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/collections" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <Collections />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/predictor" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <Predictor />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <Profile />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/coin/:coinId" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Navbar />
                  <CoinDetails />
                  <Footer />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
