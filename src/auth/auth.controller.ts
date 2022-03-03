import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  // @Req() req: Request
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this._authService.siginup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this._authService.signin(dto);
  }
}
