// google-token-verifier.service.ts
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleTokenVerifier {
  private clientId: string;
  private oAuth2Client: OAuth2Client;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    if (!this.clientId) {
      throw new Error('Google Client ID is not defined');
    }
    this.oAuth2Client = new OAuth2Client(this.clientId);
  }

  async verifyToken(idToken: string): Promise<any> {
    const ticket = await this.oAuth2Client.verifyIdToken({
      idToken,
      audience: [
        '211478218917-v2030povbi095htul9hfomvc4tmp31gb.apps.googleusercontent.com',
        '211478218917-ptmvmr61q37lnfcigbp34e1k0eegmmfi.apps.googleusercontent.com',
      ],
    });

    const payload = ticket.getPayload();

    return {
      email: payload?.email,
      firstName: payload?.given_name,
      lastName: payload?.family_name,
      userId: payload?.sub, // Google's unique identifier for the user
      // Add more fields as needed
    };
  }
}
