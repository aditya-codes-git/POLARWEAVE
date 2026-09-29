import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  ArrowRight,
  Sparkles,
  Lock,
  Mail
} from 'lucide-react';
import { DEMO_USERS, setActiveUser } from '../../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('rsharma@ncpor.res.in');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveUser(DEMO_USERS.researcher);
    navigate('/workspace');
  };

  const loginAs = (role: 'researcher' | 'admin' | 'public') => {
    setActiveUser(DEMO_USERS[role]);
    if (role === 'public') {
      navigate('/explore');
    } else {
      navigate('/workspace');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-elevated space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-polar-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.2l6 3v9.6l-6 3-6-3V7.2l6-3zM12 9l-4 2v4l4 2 4-2v-4l-4-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sign in to POLARWEAVE
          </h1>
          <p className="text-xs text-slate-500">
            Integrated Polar Science Outreach & Knowledge Repository
          </p>
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
              className="w-full p-2.5 rounded-xl bg-white border border-polar-200 hover:border-polar-300 text-left flex items-center justify-between text-xs group shadow-subtle"
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
              className="w-full p-2.5 rounded-xl bg-white border border-polar-200 hover:border-polar-300 text-left flex items-center justify-between text-xs group shadow-subtle"
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
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
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
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
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
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Sign In with Credentials
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>Public Explorer? </span>
          <button onClick={() => loginAs('public')} className="text-polar-700 font-semibold hover:underline">
            Browse public portal without login
          </button>
        </div>
      </div>
    </div>
  );
}
