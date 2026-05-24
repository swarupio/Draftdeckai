import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';
import { sendVerificationEmail } from "@/lib/email";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { validateAndSanitize, registrationSchema, detectSqlInjection, sanitizeInput } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();

    // 1. Extract utmData from the body
    const { name, email, password, referralCode, utmData } = rawBody;

    // Validate and sanitize input
    const validated = validateAndSanitize(registrationSchema, { name, email, password });
    const sanitizedName = sanitizeInput(validated.name);
    const sanitizedEmail = sanitizeInput(validated.email);
    const sanitizedReferralCode = referralCode ? String(referralCode).toUpperCase().trim() : null;

    // Additional security checks
    if (detectSqlInjection(sanitizedName) || detectSqlInjection(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input detected' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // --- CODERABBIT FIX 1: Whitelist UTM Data ---
    const safeUtmData: Record<string, string> = {};
    const allowedUtmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    if (utmData && typeof utmData === 'object') {
      allowedUtmKeys.forEach(key => {
        if (utmData[key] && typeof utmData[key] === 'string') {
          safeUtmData[key] = utmData[key].slice(0, 100); // Limit length to prevent overflow attacks
        }
      });
    }

    const supabase = await createRoute();

    const origin = (() => {
      try {
        const url = new URL((request as any).url);
        return url.origin;
      } catch {
        return process.env.NEXT_PUBLIC_SITE_URL || '';
      }
    })();

    // --- CODERABBIT FIX 2: Correct URL Trailing Slash Order ---
    const finalRedirectUrl = origin ? `${origin.replace(/\/$/, '')}/auth/callback` : undefined;

    // 2. Inject utmData into the Supabase user metadata
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: validated.password,
      options: {
        emailRedirectTo: finalRedirectUrl,
        data: {
          name: sanitizedName,
          email: sanitizedEmail,
          referral_code: sanitizedReferralCode,
          ...safeUtmData, // <-- Spreading the safe, whitelisted object
        }
      }
    });

    if (error) {
      logger.error({ route: 'app/api/auth/register/route.ts' }, 'Signup error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const requiresVerification = !data.session;
    return new Response(JSON.stringify({ message: 'Registration successful!', requiresVerification }), { status: 200 });

  } catch (error: any) {
    logger.error({ route: 'app/api/auth/register/route.ts' }, 'Unexpected error in registration:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred' }), { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';