import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Terminal,
  Trophy,
  Layers,
  FileText,
  LogOut,
  User as UserIcon,
  Sparkles,
  Users,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const adminItems: NavItem[] = [
    { to: '/admin/challenges', label: 'Manage Challenges', icon: <Layers className="w-4 h-4" /> },
    { to: '/admin/submissions', label: 'Submission Logs', icon: <FileText className="w-4 h-4" /> },
    { to: '/admin/users', label: 'Manage Users', icon: <Users className="w-4 h-4" /> },
    { to: '/challenges', label: 'Player View', icon: <Shield className="w-4 h-4" /> },
    { to: '/scoreboard', label: 'Scoreboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  const playerItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/challenges', label: 'Challenges', icon: <Shield className="w-4 h-4" /> },
    { to: '/scoreboard', label: 'Scoreboard', icon: <Trophy className="w-4 h-4" /> },
  ];

  const navItems = user ? (user.role === 'ADMIN' ? adminItems : playerItems) : [];

  const linkClass = (path: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-cyber-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-400 transition-all duration-200 glow-cyan-sm">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-wider text-gradient-cyan">
                  CTF PLAY BOX
                </span>
                <span className="block text-[10px] tracking-widest text-cyan-400/80 font-mono uppercase">
                  Cybersecurity Arena
                </span>
              </div>
            </Link>

            {/* Desktop nav links */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.to} to={item.to} className={linkClass(item.to)}>
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right section: user info & actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/90 flex items-center gap-1">
                      {user.role === 'ADMIN' ? (
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Admin
                        </span>
                      ) : (
                        'Player'
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 rounded-xl transition-all duration-150"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileOpen((o) => !o)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileOpen}
                  className="md:hidden flex items-center justify-center w-9 h-9 text-slate-300 hover:text-cyan-400 bg-slate-900/60 border border-slate-800 rounded-xl transition-colors"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-lg shadow-cyan-600/20 cta-sheen"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav drawer */}
        {user && mobileOpen && (
          <nav className="md:hidden pb-4 pt-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={linkClass(item.to)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
