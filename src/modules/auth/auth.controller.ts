import { Controller, Post, Body, ValidationPipe, Get, UseGuards, Patch, Param, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { CredentialsDto } from './dtos/credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';
import { GetUser } from './get-user.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { UserRole } from '../users/user-roles.enum';

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

    @Patch(':token')
    async confirmEmail(@Param('token') token: string) {
        const user = await this.service.confirmEmail(token);
        
        return { message: 'Verified email' };
    }

    @Post('/send-recover-email')
    async sendRecoverPasswordEmail(@Body('email') email: string): Promise<{ message: string }> {
        await this.service.sendRecoverPasswordEmail(email);

        return {
            message: 'An email has been sent with instructions to reset your password'
        };
    }

    @Patch('/reset-password/:token')
    async resetPassword(
        @Param('token') token: string,
        @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
    ): Promise<{ message: string }> {
        await this.service.resetPassword(token, changePasswordDto);

        return { message: 'Password changed successfully' };
    }

    @Patch(':id/change-password')
    @UseGuards(AuthGuard())
    async changePassword(
        @Param('id') id: string,
        @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
        @GetUser() user: User
    ) {
        if (user.role !== UserRole.ADMIN && user.id.toString() !== id) {
            throw new UnauthorizedException('You are not allowed to perform this operation');
        }

        await this.service.changePassword(id, changePasswordDto);

        return {
            message: 'Password changed successfully'
        };
    }

    @Get('/me')
    @UseGuards(AuthGuard())
    getMe(@GetUser() user: User): User {
        return user;
    }
}
