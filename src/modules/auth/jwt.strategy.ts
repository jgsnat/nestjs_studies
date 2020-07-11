import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/users.repository';
import { UnauthorizedException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        @InjectRepository(UserRepository)
        private repository: UserRepository
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'super-secret'
        });
    }

    async validate(payload: { id: number }) {
        const { id } = payload;
        const user = await this.repository.findOne(id, {
            select: ['name', 'email', 'status', 'role', 'id']
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }
}