import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        {/* Glowing 404 badge */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500/15 to-amber-500/10 border border-rose-500/30 flex items-center justify-center glow-cyan-lg shadow-2xl shadow-rose-950/30">
            <ShieldOff className="w-12 h-12 text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]" />
          </div>
          {/* Decorative spinning ring */}
          <span
            aria-hidden
            className="absolute -inset-3 rounded-[2rem] border border-rose-500/20 animate-spin-slow pointer-events-none"
          />
        </div>

        {/* 404 number */}
        <div>
          <h1 className="text-7xl sm:text-8xl font-black tracking-tighter bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 tracking-tight">
            Sector Not Found
          </h2>
          <p className="text-sm text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist, has been moved, or is classified beyond your
            current access level.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/challenges"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-600/25 transition-all cta-sheen"
          >
            <Home className="w-4 h-4" />
            <span>Go to Challenges</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 bg-cyber-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Terminal-style error log */}
        <div className="mt-6 p-4 rounded-xl bg-cyber-950 border border-slate-800/90 text-left max-w-xs mx-auto">
          <p className="text-[11px] font-mono text-slate-500 leading-relaxed">
            <span className="text-rose-400">ERR</span> route_not_found<br />
            <span className="text-slate-600">at</span> CTFPlayBox.router.resolve()<br />
            <span className="text-slate-600">status:</span>{' '}
            <span className="text-amber-400">404</span><br />
            <span className="text-slate-600">message:</span> "Requested sector does not exist"
          </p>
        </div>
      </div>
    </div>
  );
};
