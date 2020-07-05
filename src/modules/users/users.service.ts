import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRole } from './user-roles.enum';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    
    constructor(
        @InjectRepository(UserRepository)
        private repository: UserRepository
    ) {}

    async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
        if (createUserDto.password != createUserDto.passwordConfirmation) {
            throw new UnprocessableEntityException('Passwords do not match');
        } else {
            return this.repository.createUser(createUserDto, UserRole.ADMIN);
        }
    }
}
