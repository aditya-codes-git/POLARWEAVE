import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Microscope,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Globe2,
  Briefcase,
  User,
  Mail,
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { submitOnboarding } from '../../lib/api';

const EXPLORER_INTERESTS = [
  { id: 'student', label: 'Student', desc: 'Learning polar & climate science' },
  { id: 'educator', label: 'Educator', desc: 'Teaching earth sciences & expeditions' },
  { id: 'science_enthusiast', label: 'Science Enthusiast', desc: 'Curious citizen explorer' },
  { id: 'other', label: 'Other', desc: 'General visitor / curious reader' }
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useRole();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState(user.name || '');
  const [email] = useState(user.email || '');
  const [organization, setOrganization] = useState(
    user.institution && !user.institution.includes('NCPOR') && !user.institution.includes('Community')
      ? user.institution
      : ''
  );
  const [designation, setDesignation] = useState('');
  const [country, setCountry] = useState('India');

  // Role: Only 'researcher' or 'public'
  const [selectedRole, setSelectedRole] = useState<'researcher' | 'public'>('researcher');

  // Conditional fields
  const [researchDomain, setResearchDomain] = useState('Glaciology & Cryosphere Dynamics');
  const [affiliation, setAffiliation] = useState('');
  const [explorerInterest, setExplorerInterest] = useState('student');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canContinueStep1 =
    fullName.trim().length > 0 &&
    organization.trim().length > 0 &&
    designation.trim().length > 0 &&
    country.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canContinueStep1) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        full_name: fullName.trim(),
        organization: organization.trim(),
        designation: designation.trim(),
        country: country.trim(),
        role: selectedRole,
        research_domain: selectedRole === 'researcher' ? researchDomain.trim() : undefined,
        affiliation: selectedRole === 'researcher' ? affiliation.trim() : undefined,
        explorer_interest: selectedRole === 'public' ? explorerInterest : undefined
      };

      // Call backend API
      const updatedProfile = await submitOnboarding(payload);

      // Complete onboarding in RoleContext
      await completeOnboarding(updatedProfile, selectedRole);

      // Route based on role
      if (selectedRole === 'researcher') {
        navigate('/workspace', { replace: true });
      } else {
        navigate('/explore', { replace: true });
      }
    } catch (err: any) {
      console.error('[POLARWEAVE] Onboarding submission failed:', err);
      setErrorMessage(
        err?.message || 'An unexpected error occurred while saving your profile. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between overflow-x-hidden selection:bg-polar-100 selection:text-polar-900 font-sans">
      {/* Dynamic polar wave SVG background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft radial glow */}
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-sky-100/60 via-slate-100/30 to-transparent rounded-full blur-3xl" />

        {/* Animated wave path 1 */}
        <motion.svg
          className="absolute -bottom-24 left-0 w-[140%] text-slate-200/50"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ x: [0, -40, 0], y: [0, 8, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            fill="currentColor"
            fillOpacity="0.4"
            d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,144C672,149,768,203,864,208C960,213,1056,171,1152,144C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </motion.svg>

        {/* Animated wave path 2 (Icy blue counter-flow) */}
        <motion.svg
          className="absolute -bottom-36 left-0 w-[150%] text-sky-100/40"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ x: [-40, 0, -40], y: [0, -6, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            fill="currentColor"
            fillOpacity="0.5"
            d="M0,64L48,80C96,96,192,128,288,149.3C384,171,480,181,576,160C672,139,768,85,864,90.7C960,96,1056,160,1152,181.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </motion.svg>
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="POLARWEAVE Logo"
            className="h-9 w-auto object-contain"
          />
          <div className="hidden sm:block border-l border-slate-200 pl-3">
            <span className="text-[11px] font-mono tracking-wider uppercase text-slate-500 font-semibold">
              Polar Science Knowledge Platform
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              step === 1
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
          </div>
          <div className="w-8 h-0.5 bg-slate-200" />
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              step === 2
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            2
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* STEP 1: PERSONAL & INSTITUTION PROFILE */
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-9 shadow-sm"
              >
                <div className="mb-6 space-y-1">
                  <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0369A1]">
                    Step 1 of 2 • Identity & Affiliation
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Welcome to POLARWEAVE
                  </h1>
                  <p className="text-sm text-slate-600">
                    Let's set up your profile to personalize your polar research & discovery experience.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Unable to proceed</p>
                      <p className="text-red-700 mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Name</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
                    />
                  </div>

                  {/* Email (Read-only from Google) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Email Address</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        Google Verified
                      </span>
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-500 bg-slate-50/80 cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Grid: Organization & Designation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Organization / Institution</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. NCPOR / University"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>Designation / Role Title</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Senior Glaciologist"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Country</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India, Norway, United States"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>NCPOR Secure Identity verification</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (canContinueStep1) {
                        setErrorMessage(null);
                        setStep(2);
                      } else {
                        setErrorMessage('Please fill in all required fields marked with *');
                      }
                    }}
                    disabled={!canContinueStep1}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Continue to Role</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* STEP 2: ROLE SELECTION & ROLE SPECIFICS */
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-9 shadow-sm"
              >
                <div className="mb-6 space-y-1">
                  <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0369A1]">
                    Step 2 of 2 • Role & Purpose
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    How will you use POLARWEAVE?
                  </h1>
                  <p className="text-sm text-slate-600">
                    Choose your primary workspace mode. You can access public discovery from any role.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Error saving profile</p>
                      <p className="text-red-700 mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Role Cards: Researcher vs Public Explorer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Card 1: Researcher */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRole('researcher')}
                    className={`relative p-5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedRole === 'researcher'
                        ? 'border-[#0284C7] bg-sky-50/40 ring-2 ring-[#0284C7]/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          selectedRole === 'researcher'
                            ? 'bg-[#0284C7] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Microscope className="w-5 h-5" />
                      </div>
                      {selectedRole === 'researcher' && (
                        <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Researcher
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Contribute expedition reports, ingest raw datasets, trace evidence links, and build polar knowledge.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-medium text-[#0369A1]">
                      <span>Researcher Workspace Access</span>
                    </div>
                  </motion.div>

                  {/* Card 2: Public Explorer */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedRole('public')}
                    className={`relative p-5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedRole === 'public'
                        ? 'border-[#0284C7] bg-sky-50/40 ring-2 ring-[#0284C7]/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          selectedRole === 'public'
                            ? 'bg-[#0284C7] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Compass className="w-5 h-5" />
                      </div>
                      {selectedRole === 'public' && (
                        <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Public Explorer
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Explore polar science, verified expedition timelines, interactive maps, multimedia stories, and explainers.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-medium text-[#0369A1]">
                      <span>Public Discovery Portal Access</span>
                    </div>
                  </motion.div>
                </div>

                {/* Sub-form based on selected role */}
                <AnimatePresence mode="wait">
                  {selectedRole === 'researcher' ? (
                    <motion.div
                      key="researcher-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 pt-2 border-t border-slate-100"
                    >
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Research Domain / Primary Area of Interest
                        </label>
                        <select
                          value={researchDomain}
                          onChange={(e) => setResearchDomain(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
                        >
                          <option value="Glaciology & Cryosphere Dynamics">Glaciology & Cryosphere Dynamics</option>
                          <option value="Oceanography & Sea Ice Physics">Oceanography & Sea Ice Physics</option>
                          <option value="Atmospheric Sciences & Paleoclimate">Atmospheric Sciences & Paleoclimate</option>
                          <option value="Polar Biology & Marine Ecosystems">Polar Biology & Marine Ecosystems</option>
                          <option value="Space Physics & Geomagnetism">Space Physics & Geomagnetism</option>
                          <option value="Geology & Solid Earth Geophysics">Geology & Solid Earth Geophysics</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Research Group / Lab Affiliation (Optional)</span>
                          <span className="text-[10px] text-slate-400 font-mono">Optional</span>
                        </label>
                        <input
                          type="text"
                          value={affiliation}
                          onChange={(e) => setAffiliation(e.target.value)}
                          placeholder="e.g. Cryosphere Research Group, Center for Arctic Studies"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 focus:border-[#0284C7] transition-all"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="public-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 pt-2 border-t border-slate-100"
                    >
                      <label className="block text-xs font-semibold text-slate-700">
                        What best describes your interest in polar science?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {EXPLORER_INTERESTS.map((item) => (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() => setExplorerInterest(item.id)}
                            className={`p-3 rounded-lg border text-left text-xs transition-all ${
                              explorerInterest === item.id
                                ? 'border-[#0284C7] bg-sky-50/50 text-[#0369A1] font-semibold'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-semibold text-slate-900">{item.label}</div>
                            <div className="text-[11px] text-slate-500 font-normal">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setStep(1);
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                        <span>Saving Profile & Setting up Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup & Enter Platform</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 py-4 text-center">
        <p className="text-[11px] text-slate-400">
          POLARWEAVE • National Centre for Polar and Ocean Research (NCPOR) • Ministry of Earth Sciences, Govt. of India
        </p>
      </footer>
    </div>
  );
}
