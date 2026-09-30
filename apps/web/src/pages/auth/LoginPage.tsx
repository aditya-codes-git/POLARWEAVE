import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { DEMO_USERS, setActiveUser, signInWithGoogle } from '../../lib/supabase';
import { useRole } from '../../context/RoleContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { switchRole } = useRole();
  const [email, setEmail] = useState('rsharma@ncpor.res.in');
  const [password, setPassword] = useState('password123');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveUser(DEMO_USERS.researcher);
    switchRole('researcher');
    navigate('/workspace');
  };

  const loginAs = (role: 'researcher' | 'admin' | 'public') => {
    setActiveUser(DEMO_USERS[role]);
    switchRole(role);
    if (role === 'public') {
      navigate('/explore');
    } else {
      navigate('/workspace');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage(null);
      await signInWithGoogle();
      // Browser will redirect to Google's consent screen and callback to /workspace
    } catch (err: any) {
      console.error('[POLARWEAVE] Google sign in failed:', err);
      setErrorMessage(
        err?.message ||
        'Unable to complete Google authentication. Please check your Supabase Google OAuth provider settings.'
      );
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-elevated space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="POLARWEAVE"
            className="h-12 w-auto object-contain mx-auto"
          />
          <p className="text-xs text-slate-500">
            Integrated Polar Science Outreach & Knowledge Repository
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-red-900">Authentication Error</p>
              <p className="text-red-700 leading-relaxed text-[11px]">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-subtle flex items-center justify-center gap-3 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-polar-600" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' Mark SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            or use demo profile
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {/* 1-Click Role Switcher for SIH Demonstration */}
        <div className="p-4 bg-polar-50/60 rounded-2xl border border-polar-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-polar-800">
            <Sparkles className="w-3.5 h-3.5 text-polar-600" />
            <span>SIH Quick Access Demo Profiles</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => loginAs('researcher')}
              className="w-full p-2.5 rounded-xl bg-white border border-polar-200 hover:border-polar-300 text-left flex items-center justify-between text-xs group shadow-subtle cursor-pointer"
            >
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-polar-700">
                  Dr. Rajesh Sharma
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Expedition Researcher • Glaciology Lead
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => loginAs('admin')}
              className="w-full p-2.5 rounded-xl bg-white border border-polar-200 hover:border-polar-300 text-left flex items-center justify-between text-xs group shadow-subtle cursor-pointer"
            >
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-polar-700">
                  Dr. Sunita Bose
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Knowledge Manager & MoES Admin
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-polar-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-polar-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Sign In with Email
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-1">
          <span>Public Explorer? </span>
          <button onClick={() => loginAs('public')} className="text-polar-700 font-semibold hover:underline cursor-pointer">
            Browse public portal without login
          </button>
        </div>
      </div>
    </div>
  );
}
