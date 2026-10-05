import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  PartyPopper,
  CheckCircle2,
  Award,
  ArrowRight,
  X,
  Flame,
} from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPoints: number;
  totalChallenges: number;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  totalPoints,
  totalChallenges,
}) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Confetti particle system
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }> = [];

    // Create 120 particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * 0.5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 6,
        opacity: 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Confetti Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Modal Dialog Box */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-gradient-to-b from-cyber-900 via-cyber-900/95 to-cyber-950 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10 p-6 sm:p-8 overflow-hidden text-center">
        {/* Glow ambient circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-br from-yellow-500/15 via-emerald-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-20"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Trophy & Badge Icon */}
          <div className="relative inline-block mx-auto mt-2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/20 to-emerald-500/20 border-2 border-yellow-500/50 flex items-center justify-center shadow-lg shadow-yellow-500/20 animate-bounce">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-cyber-950 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Congratulations Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-semibold">
              <PartyPopper className="w-3.5 h-3.5" /> CTF Arena Cleared 100%
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              You Successfully Completed the CTF!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Outstanding work, hacker! You conquered all <span className="text-yellow-400 font-semibold">{totalChallenges}</span> stages, captured every flag, and proved your security skills.
            </p>
          </div>

          {/* Stats Showcase */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-cyber-950/90 border border-slate-800">
            <div className="p-3 rounded-xl bg-cyber-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Total Score
              </span>
              <div className="flex items-center justify-center gap-1 font-mono text-xl sm:text-2xl font-bold text-yellow-400">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>{totalPoints} pts</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyber-900/60 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Tasks Completed
              </span>
              <div className="flex items-center justify-center gap-1 font-mono text-xl sm:text-2xl font-bold text-emerald-400">
                <Flame className="w-5 h-5 text-emerald-400" />
                <span>{totalChallenges} / {totalChallenges}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                navigate('/scoreboard');
              }}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-cyber-950 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:brightness-110 rounded-xl shadow-lg shadow-yellow-500/20 transition-all font-sans"
            >
              <Trophy className="w-4 h-4 text-cyber-950" />
              <span>View Scoreboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 text-sm font-medium text-slate-300 hover:text-white bg-cyber-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            >
              Review Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
