import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';

import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private _prismaService: PrismaService,
    private _jwtService: JwtService,
    private _configService: ConfigService
  ) { }

  async siginup(dto: AuthDto): Promise<{ access_token: string }> {
    // generate the password
    const hash = await argon.hash(dto.password);

    try {
      const user = await this._prismaService.user.create({
        data: {
          email: dto.email,
          hash
        },
        /* select: {
          id: true,
          email: true,
          createdAt: true
        } */
      });
  
      // delete user.hash;
  
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async signin(dto: AuthDto) : Promise<{ access_token: string }> {
    const user = await this._prismaService.user.findUnique({
      where: {
        email: dto.email,
      }
    })

    if (!user)
      throw new ForbiddenException(`Credentials incorrect`);
    
    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches)
      throw new ForbiddenException(`Credentials incorrect`);
    
    // delete user.hash;

    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this._configService.get('JWT_SECRET');
    const token = await this._jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: secret
    });

    return {
      access_token: token
    };
  }
}
