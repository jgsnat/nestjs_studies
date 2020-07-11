import { Injectable, UnprocessableEntityException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/users.repository';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-roles.enum';
import { CredentialsDto } from './dtos/credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { randomBytes } from 'crypto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserRepository)
        private repository: UserRepository,
        private jwtService: JwtService,
        private mailerService: MailerService
    ) {}

    async signUp(createUserDto: CreateUserDto): Promise<User> {
        if (createUserDto.password != createUserDto.passwordConfirmation) {
            throw new UnprocessableEntityException('Passwords do not match');
        } else {
            const user = await this.repository.createUser(createUserDto, UserRole.USER);
            const mail = {
                to: user.email,
                from: 'noreply@application.com',
                subject: 'Confirmation email',
                template: 'email-confirmation',
                context: {
                    token: user.confirmationToken
                }
            };
            await this.mailerService.sendMail(mail);

            return user;
        }
    }

    async signIn(credentialsDto: CredentialsDto) {
        const user = await this.repository.checkCredentials(credentialsDto);

        if (user === null) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const jwtPayload = {
            id: user.id
        };
        const token = await this.jwtService.sign(jwtPayload);

        return { token };
    }

    async confirmEmail(confirmationToken: string): Promise<void> {
        const result = await this.repository.update(
            { confirmationToken },
            { confirmationToken: null }
        );
        if (result.affected === 0) throw new NotFoundException('Invalid token');
    }

    async sendRecoverPasswordEmail(email: string): Promise<void> {
        const user = await this.repository.findOne({ email });

        if (!user) {
            throw new NotFoundException('There is no user registered with this email.');
        }

        user.recoverToken = randomBytes(32).toString('hex');
        await user.save();

        const mail = {
            to: user.email,
            from: 'noreply@application.com',
            subject: 'Password recovery',
            template: 'recover-password',
            context: {
                token: user.recoverToken
            }
        };
        await this.mailerService.sendMail(mail);
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { password, passwordConfirmation } = changePasswordDto;

        if (password != passwordConfirmation) {
            throw new UnprocessableEntityException('Passwords do not match');
        }

        await this.repository.changePassword(id, password);
    }

    async resetPassword(recoverToken: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const user = await this.repository.findOne(
            { recoverToken },
            {
                select: ['id']
            }
        );

        if (!user) {
            throw new NotFoundException('Token inválido.');
        }

        try {
            await this.changePassword(user.id.toString(), changePasswordDto);
        } catch (err) {
            throw err;
        }
    }
}
