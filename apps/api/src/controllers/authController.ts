import { Request, Response } from 'express';
import { getUserProfileByUserId, upsertUserProfile } from '../db/repository.js';
import { UserProfile } from '@polarweave/types';

/**
 * GET /api/auth/me
 * Retrieves current caller's profile and onboarding status
 */
export async function getCurrentUserProfile(req: Request, res: Response) {
  const caller = req.user;
  if (!caller) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }

  // Check persisted profile
  const profile = await getUserProfileByUserId(caller.id);

  if (profile) {
    return res.status(200).json({
      success: true,
      data: profile
    });
  }

  // If not found in DB, return default synthesized from caller credentials
  const defaultProfile: UserProfile = {
    id: caller.id,
    user_id: caller.id,
    full_name: caller.name || '',
    email: caller.email || '',
    role: caller.role,
    institution: caller.role === 'admin' ? 'Ministry of Earth Sciences (MoES)' : 'National Centre for Polar and Ocean Research (NCPOR)',
    organization: caller.role === 'admin' ? 'Ministry of Earth Sciences (MoES)' : 'National Centre for Polar and Ocean Research (NCPOR)',
    onboarding_completed: caller.role === 'admin' ? true : false,
    created_at: new Date().toISOString()
  };

  return res.status(200).json({
    success: true,
    data: defaultProfile
  });
}

/**
 * POST /api/auth/onboarding
 * Completes onboarding and sets profile details + selected role
 * STRICT SECURITY: Rejects any attempt to escalate role to 'admin'
 */
export async function completeOnboarding(req: Request, res: Response) {
  const caller = req.user;
  if (!caller) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required to complete onboarding' }
    });
  }

  const {
    full_name,
    organization,
    designation,
    country,
    role,
    research_domain,
    affiliation,
    explorer_interest
  } = req.body;

  // 1. Strict validation: Role can ONLY be 'researcher' or 'public'
  if (role === 'admin' || role === 'knowledge_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ROLE_ELEVATION_FORBIDDEN',
        message: 'Knowledge Admin role cannot be self-selected through onboarding.'
      }
    });
  }

  if (role !== 'researcher' && role !== 'public') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ROLE',
        message: 'Role must be either "researcher" or "public".'
      }
    });
  }

  // 2. Validate required fields
  if (!full_name || !String(full_name).trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELD', message: 'Full name is required.' }
    });
  }
  if (!organization || !String(organization).trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELD', message: 'Organization / Institution is required.' }
    });
  }
  if (!designation || !String(designation).trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELD', message: 'Designation / Role title is required.' }
    });
  }
  if (!country || !String(country).trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELD', message: 'Country is required.' }
    });
  }

  // 3. Save profile
  const saved = await upsertUserProfile({
    id: caller.id,
    user_id: caller.id,
    email: caller.email,
    full_name: String(full_name).trim(),
    organization: String(organization).trim(),
    institution: String(organization).trim(),
    designation: String(designation).trim(),
    country: String(country).trim(),
    role: role as 'researcher' | 'public',
    research_domain: research_domain ? String(research_domain).trim() : undefined,
    affiliation: affiliation ? String(affiliation).trim() : undefined,
    explorer_interest: explorer_interest ? String(explorer_interest).trim() : undefined,
    onboarding_completed: true
  });

  return res.status(200).json({
    success: true,
    data: saved
  });
}
