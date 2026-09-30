import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getCurrentUserProfile } from '../../lib/api';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying authentication...');

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        if (!supabase) {
          navigate('/login', { replace: true });
          return;
        }

        // Wait for session to be available
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          // If hash fragment is being processed by Supabase, listen for the event
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (newSession?.user && isMounted) {
              subscription.unsubscribe();
              await resolveAndRoute(newSession.user);
            }
          });
          return;
        }

        await resolveAndRoute(user);
      } catch (err) {
        console.error('[POLARWEAVE] Auth callback resolution error:', err);
        if (isMounted) navigate('/workspace', { replace: true });
      }
    }

    async function resolveAndRoute(user: any) {
      if (!isMounted) return;
      setStatus('Checking onboarding status...');

      const email = user.email || '';
      const meta = user.user_metadata || {};
      const isAdm = email.toLowerCase().includes('admin') || meta.role === 'admin';

      if (isAdm) {
        navigate('/workspace', { replace: true });
        return;
      }

      // Check persisted profile from backend database
      try {
        const profile = await getCurrentUserProfile();
        if (profile?.onboarding_completed) {
          const target = profile.role === 'public' ? '/explore' : '/workspace';
          navigate(target, { replace: true });
          return;
        }
      } catch (e) {
        console.warn('[POLARWEAVE] Profile check error in callback:', e);
      }

      // If profile is not complete or not found -> Go directly to /onboarding (NEVER /workspace)
      navigate('/onboarding', { replace: true });
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-polar-600" />
        <p className="text-sm font-medium">{status}</p>
      </div>
    </div>
  );
}
