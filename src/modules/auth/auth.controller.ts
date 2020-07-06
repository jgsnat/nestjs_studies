import { Controller, Post, Body, ValidationPipe, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { CredentialsDto } from './dtos/credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {

    constructor(
        private service: AuthService
    ) {}

    @Post('/signup')
    async signUp(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<{ message: string }> {
        await this.service.signUp(createUserDto);
        return {
            message: 'Successful registration'
        };
    }

    @Post('/signin')
    async signIn(@Body(ValidationPipe) credentialsDto: CredentialsDto): Promise<{ token: string }> {
        return await this.service.signIn(credentialsDto);
    }

    @Get('/me')
    @UseGuards(AuthGuard())
    getMe(@GetUser() user: User): User {
        return user;
    }
}
