import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth20'


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            clientID: '211478218917-v2030povbi095htul9hfomvc4tmp31gb.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: 'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile']
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken
        }
        done(null, user);
    }
}