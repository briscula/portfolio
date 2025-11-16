import { getAccessToken } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { accessToken } = await getAccessToken(req, NextResponse.next(), {
      refresh: false
    });

    // Decode the token header to see what type it is
    let tokenInfo = null;
    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length >= 1) {
          const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
          tokenInfo = {
            algorithm: header.alg,
            encryption: header.enc,
            type: header.alg === 'dir' ? 'JWE (encrypted)' : 'JWT',
            issuer: header.iss
          };
        }
      } catch (decodeError) {
        console.error('Error decoding token header:', decodeError);
      }
    }

    return NextResponse.json({
      accessToken,
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0,
      audience: process.env.AUTH0_AUDIENCE,
      tokenInfo,
      isEncrypted: tokenInfo?.algorithm === 'dir',
      note: 'JWE tokens are encrypted. Your API needs to decrypt them or Auth0 API settings need to be configured for JWT.'
    });
  } catch (error) {
    console.error('Error getting access token:', error);
    return NextResponse.json(
      {
        error: 'Failed to get access token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}