import { PassportStrategy } from '@nestjs/passport';

import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>(
        'GOOGLE_CALLBACK_URL',
      )}/google/redirect`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails } = profile; //PHOTO는 안받음
      const user = {
        email: emails[0].value,
        firstName: name.familyName,
        lastName: name.givenName,
        accessToken,
      };
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
}
