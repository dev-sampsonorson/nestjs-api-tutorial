import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    
    constructor(
        private _userSerivce: UserService
    ) {}

    @Get('me')
    getMe(@GetUser() user: User) { // @GetUser('') user: User
        return user;
    }

    @Patch()
    async editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
        return await this._userSerivce.editUser(userId, dto);
    }
}
