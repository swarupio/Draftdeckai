import { logger } from '@/lib/logger';
import { createRoute } from '@/lib/supabase/server';
import { validateAndSanitize, registrationSchema, detectSqlInjection, sanitizeInput } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const { name, email, password, referralCode, utmData } = rawBody;

    const validated = validateAndSanitize(registrationSchema, { name, email, password });
    const sanitizedName = sanitizeInput(validated.name);
    const sanitizedEmail = sanitizeInput(validated.email);
    const sanitizedReferralCode = referralCode ? String(referralCode).toUpperCase().trim() : null;

    if (detectSqlInjection(sanitizedName) || detectSqlInjection(sanitizedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

    // Whitelist UTM Data for security
    const safeUtmData: Record<string, string> = {};
    const allowedUtmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    if (utmData && typeof utmData === 'object') {
      allowedUtmKeys.forEach(key => {
        if (utmData[key] && typeof utmData[key] === 'string') {
          safeUtmData[key] = utmData[key].slice(0, 100);
        }
      });
    }

    const supabase = await createRoute();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || '';
    const finalRedirectUrl = `${origin.replace(/\/$/, '')}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: validated.password,
      options: {
        emailRedirectTo: finalRedirectUrl,
        data: { name: sanitizedName, email: sanitizedEmail, referral_code: sanitizedReferralCode, ...safeUtmData }
      }
    });

    if (error) {
      logger.error({ route: 'app/api/auth/register/route.ts' }, 'Signup error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Success', requiresVerification: !data.session }), { status: 200 });
  } catch (error: any) {
    logger.error({ route: 'app/api/auth/register/route.ts' }, 'Error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}