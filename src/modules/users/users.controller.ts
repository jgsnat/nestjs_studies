import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ReturnUserDto } from './dtos/return-user.dto';

@Controller('users')
export class UsersController {

    constructor(
        private service: UsersService
    ) {}

    @Post()
    async createAdminUser(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ReturnUserDto> {
        const user = await this.service.createAdminUser(createUserDto);
        return {
            user,
            message: 'Administrator successfully registered'
        }
    }
}
