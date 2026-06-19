import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Plots from './pages/Plots';
import PlotDetail from './pages/PlotDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import SiteVisits from './pages/SiteVisits';
import Analytics from './pages/Analytics';
import Landing from './pages/Landing';
import AIChatbot from './components/AIChatbot';
import AIAssistant from './pages/AIAssistant';

/* Layout wrapper — sidebar + content area for authenticated pages */
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar />
      <main className="lg:ml-64 min-h-[calc(100vh-57px)] lg:min-h-screen">
        <div className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <AIChatbot />
    </div>
  );
};

/* Public route — redirects to dashboard if already logged in */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
          <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <LanguageProvider>
      <AuthProvider>
        {/* Toast notification system */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              background: '#1e293b',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />

        <Routes>
          {/* Public marketing site */}
          <Route path="/" element={<Landing />} />

          {/* Auth pages — public only */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected dashboard pages */}
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/plots" element={<ProtectedRoute><AppLayout><Plots /></AppLayout></ProtectedRoute>} />
          <Route path="/plots/:id" element={<ProtectedRoute><AppLayout><PlotDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><AppLayout><Customers /></AppLayout></ProtectedRoute>} />
          <Route path="/customers/:id" element={<ProtectedRoute><AppLayout><CustomerDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/site-visits" element={<ProtectedRoute><AppLayout><SiteVisits /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AppLayout><AIAssistant /></AppLayout></ProtectedRoute>} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
