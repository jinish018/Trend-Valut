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
import Profile from './pages/Profile'; // Add this import
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

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
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Navbar />
                <Dashboard />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/highlights" element={
              <ProtectedRoute>
                <Navbar />
                <Highlights />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/all" element={
              <ProtectedRoute>
                <Navbar />
                <AllCoins />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Navbar />
                <Portfolio />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/collections" element={
              <ProtectedRoute>
                <Navbar />
                <Collections />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Navbar />
                <Profile />
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/coin/:coinId" element={
              <ProtectedRoute>
                <Navbar />
                <CoinDetails />
                <Footer />
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
