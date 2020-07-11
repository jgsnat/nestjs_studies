import { Injectable, UnprocessableEntityException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRole } from './user-roles.enum';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/update-users.dto';
import { FindUsersQueryDto } from './dtos/find-users-query.dto';

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

    async findUserById(userId: string): Promise<User> {
        const user = await this.repository.findOne(userId, {
            select: ['email', 'name', 'role', 'id']
        });

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    /*
    // DEPRECIATED
    async updateUser(updateUserDto: UpdateUserDto, id: string): Promise<User> {
        const user = await this.findUserById(id);
        
        if (!user) throw new NotFoundException('User not found');

        const { name, email, role, status } = updateUserDto;
        user.name = name ? name : user.name;
        user.email = email ? email : user.email;
        user.role = role ? role : user.role;
        user.status = status === undefined ? user.status : status;
        try {
            await user.save();

            return user;
        } catch (err) {
            throw new InternalServerErrorException('Error saving the user in the database');
        }
    }*/

    async updateUser(updateUserDto: UpdateUserDto, id: string) {
        const result = await this.repository.update({ id }, updateUserDto);

        if (result.affected > 0) {
            const user = await this.findUserById(id);

            return user;
        } else {
            throw new NotFoundException('User not found');
        }
    }
    
    async deleteUser(userId: string) {
        const result = await this.repository.delete({ id: userId });
        if (result.affected === 0) {
            throw new NotFoundException('A user with the given ID was not found');
        }
    }

    async findUsers(queryDto: FindUsersQueryDto): Promise<{ users: User[], total: number }> {
        const users = await this.repository.findUsers(queryDto);

        return users;
    }
    
}
