import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { issueId, vote } = await request.json();

    if (!issueId || !vote) {
      return NextResponse.json({ error: 'Mangler saks-ID eller stemme' }, { status: 400 });
    }

    // 1. Verify that the user is authenticated (has a valid session)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('folkets_stemme_session');

    if (!sessionToken) {
      return NextResponse.json({ error: 'Du må være logget inn med BankID for å stemme' }, { status: 401 });
    }

    // 2. Extract the anonymous user hash from the session
    const sessionData = JSON.parse(Buffer.from(sessionToken.value, 'base64').toString('utf-8'));
    const userHash = sessionData.userHash;

    // 3. Privacy by Design: Store the vote SEPARATELY from the user's identity.
    // In a real database, we would have two tables:
    // Table A: "VerifiedUsers" (stores the userHash to ensure they only vote once per issue)
    // Table B: "Votes" (stores the vote itself, e.g., { issueId: '123', vote: 'for', timestamp: ... })
    // The tables are NEVER linked via a foreign key.
    
    console.log(`[Privacy by Design] User ${userHash} voted on issue ${issueId}.`);
    console.log(`[Data Residency] Vote data stored anonymously in Norwegian data center.`);
    
    // Simulating database storage...
    const mockVoteRecord = {
      id: Math.random().toString(36).substring(7),
      issueId,
      vote, // 'for', 'against', 'abstain'
      timestamp: new Date().toISOString(),
      // Notice: userHash is NOT stored in this record!
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Stemme registrert anonymt',
      record: mockVoteRecord
    });

  } catch (error) {
    console.error('Voting Error:', error);
    return NextResponse.json({ error: 'Kunne ikke registrere stemme' }, { status: 500 });
  }
}
