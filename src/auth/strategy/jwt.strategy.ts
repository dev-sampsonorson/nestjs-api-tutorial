import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private _configService: ConfigService,
        private _prismaService: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            // ignoreExpiration: false,
            secretOrKey: _configService.get('JWT_SECRET')
        })
    }

    async validate(payload: { sub: number, email: string }) {
        const user = await this._prismaService.user.findUnique({
            where: {
                id: payload.sub
            }
        });

        delete user.hash;

        // if the user is null, there would be a 401 exception
        return user;
    }
}