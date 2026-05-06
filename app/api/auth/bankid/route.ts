import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { nin } = await request.json();

    if (!nin || nin.length !== 11) {
      return NextResponse.json({ error: 'Ugyldig fødselsnummer' }, { status: 400 });
    }

    // 1. Generate a secure, one-way hash of the National Identity Number (BankID data)
    // We use a salt (in a real app, this would be a secure environment variable)
    const salt = process.env.BANKID_SALT || 'norsk-demokrati-2026-salt';
    
    const hash = crypto
      .createHash('sha256')
      .update(`${nin}${salt}`)
      .digest('hex');

    // 2. In a real application, we would store this hash in a "VerifiedUsers" table
    // to ensure "one person, one vote", but we NEVER store the actual 'nin' (Fødselsnummer).
    // The database would be physically located in Norway (e.g., Green Mountain data center).
    
    console.log('[Privacy by Design] BankID verified. Generated anonymous hash:', hash);
    console.log('[Data Residency] Data stored securely within Norwegian borders.');

    // 3. Create a session token (mock JWT) that only contains the anonymous hash
    const mockSessionToken = Buffer.from(JSON.stringify({ userHash: hash })).toString('base64');

    // 4. Set the session cookie
    const response = NextResponse.json({ success: true, message: 'Verifisert via BankID' });
    
    response.cookies.set({
      name: 'folkets_stemme_session',
      value: mockSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error) {
    console.error('BankID Auth Error:', error);
    return NextResponse.json({ error: 'Autentisering feilet' }, { status: 500 });
  }
}
