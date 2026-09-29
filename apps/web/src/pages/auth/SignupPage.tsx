import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { setActiveUser, DEMO_USERS } from '../../lib/supabase';

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('NCPOR');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveUser({
      id: `usr_${Date.now()}`,
      email: email || 'researcher@ncpor.res.in',
      name: fullName || 'Polar Researcher',
      role: 'researcher',
      institution: institution || 'NCPOR'
    });
    navigate('/workspace');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-elevated space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Create POLARWEAVE Account
          </h1>
          <p className="text-xs text-slate-500">
            Access scientific ingestion, evidence linking, and outreach tools
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Rajesh Sharma"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-polar-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Institutional Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rsharma@ncpor.res.in"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-polar-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Institution / Department</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="National Centre for Polar and Ocean Research"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-polar-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Create Researcher Account
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <button onClick={() => navigate('/login')} className="text-polar-700 font-semibold hover:underline">
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
