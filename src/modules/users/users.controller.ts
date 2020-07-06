import { Controller, Post, Body, ValidationPipe, UseGuards, Get, Param, Patch, ForbiddenException, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ReturnUserDto } from './dtos/return-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.decorator';
import { UserRole } from './user-roles.enum';
import { UpdateUserDto } from './dtos/update-users.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from './user.entity';
import { FindUsersQueryDto } from './dtos/find-users-query.dto';

@Controller('users')
@UseGuards(AuthGuard(), RolesGuard)
export class UsersController {

    constructor(
        private service: UsersService
    ) {}

    @Post()
    @Role(UserRole.ADMIN)
    async createAdminUser(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ReturnUserDto> {
        const user = await this.service.createAdminUser(createUserDto);
        
        return {
            user,
            message: 'Administrator successfully registered'
        };
    }

    @Get(':id')
    @Role(UserRole.ADMIN)
    async findUserByid(@Param('id') id): Promise<ReturnUserDto> {
        const user = await this.service.findUserById(id);
        
        return {
            user,
            message: 'User found'
        };
    }

    @Patch(':id')
    async updateUser(
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
        @GetUser() user: User,
        @Param('id') id: string
    ) {
        if (user.role != UserRole.ADMIN && user.id.toString() != id) {
            throw new ForbiddenException('You are not authorized to access this feature');
        } else {
            return this.service.updateUser(updateUserDto, id);
        }
    }

    @Delete(':id')
    @Role(UserRole.ADMIN)
    async deleteUser(@Param('id') id: string) {
        await this.service.deleteUser(id);

        return {
            message: 'User removed successfully'
        };
    }

    @Get()
    @Role(UserRole.ADMIN)
    async findUsers(@Query() query: FindUsersQueryDto) {
        const list = await this.service.findUsers(query);

        return {
            list,
            message: 'Users found'
        };
    }
}
