import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { DashboardView } from './views/DashboardView';
import { ChallengesView } from './views/ChallengesView';
import { ScoreboardView } from './views/ScoreboardView';
import { AdminChallengesView } from './views/AdminChallengesView';
import { AdminSubmissionsView } from './views/AdminSubmissionsView';
import { AdminUsersView } from './views/AdminUsersView';
import { Stage3GatewayView } from './views/Stage3GatewayView';
import { Stage4GatewayView } from './views/Stage4GatewayView';
import { Stage6TerminalView } from './views/Stage6TerminalView';
import { Stage1OSINTView } from './views/Stage1OSINTView';
import { Stage7BinaryView } from './views/Stage7BinaryView';
import { Stage8TerminalView } from './views/Stage8TerminalView';
import { NotFoundView } from './views/NotFoundView';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-cyber-950 text-slate-100">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="py-6 border-t border-slate-900 bg-cyber-950/80 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CYBERVAULT: OPERATION AEGIS BREACH • Group 46</span>
          <span>Spring Boot 3 + React 18 + MySQL 8.4 + Docker</span>
        </div>
      </footer>
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/challenges" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              {/* Public interactive challenge routes */}
              <Route path="/login" element={<LoginView />} />
              <Route path="/register" element={<RegisterView />} />
              
              {/* Stage 1: OSINT */}
              <Route path="/osint" element={<Stage1OSINTView />} />
              <Route path="/stage1-osint" element={<Stage1OSINTView />} />

              {/* Stage 4: Web Security (and legacy stage3) */}
              <Route path="/stage4-gateway" element={<Stage4GatewayView />} />
              <Route path="/stage3-gateway" element={<Stage3GatewayView />} />

              {/* Stage 7: Reverse Engineering */}
              <Route path="/stage7-binary" element={<Stage7BinaryView />} />

              {/* Stage 8: Capstone Terminal (and legacy stage6) */}
              <Route path="/stage8-terminal" element={<Stage8TerminalView />} />
              <Route path="/stage6-terminal" element={<Stage6TerminalView />} />

              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Player protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges"
                element={
                  <ProtectedRoute>
                    <ChallengesView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scoreboard"
                element={
                  <ProtectedRoute>
                    <ScoreboardView />
                  </ProtectedRoute>
                }
              />

              {/* Admin protected routes */}
              <Route
                path="/admin/challenges"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminChallengesView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/submissions"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSubmissionsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsersView />
                  </ProtectedRoute>
                }
              />

              {/* 404 — styled Not Found page instead of silent redirect */}
              <Route path="*" element={<NotFoundView />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
