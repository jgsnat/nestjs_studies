import { TestingModule, Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserRole } from './user-roles.enum';
import { UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { FindUsersQueryDto } from './dtos/find-users-query.dto';

const mockUserRepository = () => ({
    createUser: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findUsers: jest.fn(),
    update: jest.fn()
});

describe('UsersService', () => {
    let repository;
    let service;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: UserRepository,
                    useFactory: mockUserRepository
                }
            ]
        }).compile();

        repository = await module.get<UserRepository>(UserRepository);
        service = await module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(repository).toBeDefined();
    });

    describe('createUser', () => {
        let mockCreateUserDto: CreateUserDto;

        beforeEach(() => {
            mockCreateUserDto = {
                email: 'mock@email.com',
                name: 'Mock User',
                password: 'mockPassword',
                passwordConfirmation: 'mockPassword'
            };
        });

        it('should create an user if passwords match', async () => {
            repository.createUser.mockResolvedValue('mockUser');
            const result = await service.createAdminUser(mockCreateUserDto);

            expect(repository.createUser).toHaveBeenCalledWith(
                mockCreateUserDto,
                UserRole.ADMIN
            );
            expect(result).toEqual('mockUser');
        });

        it('should throw an error if passwords doesnt match', async () => {
            mockCreateUserDto.passwordConfirmation = 'wrongPassword';            
            expect(service.createAdminUser(mockCreateUserDto)).rejects.toThrow(UnprocessableEntityException);
        });
    });

    describe('findUserById', () => {
        it('should return the found user', async () => {
            repository.findOne.mockResolvedValue('mockUser');
            expect(repository.findOne).not.toHaveBeenCalled();

            const result = await service.findUserById('mockId');
            const select = ['email', 'name', 'role', 'id'];
            expect(repository.findOne).toHaveBeenCalledWith('mockId', { select });
            expect(result).toEqual('mockUser');
        });

        it('should throw an error as user is not found', async () => {
            repository.findOne.mockResolvedValue(null);
            expect(service.findUserById('mockId')).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteUser', () => {
        it('should return affected > 0 if user is deleted', async () => {
            repository.delete.mockResolvedValue({ affected: 1 });

            await service.deleteUser('mockId');
            expect(repository.delete).toHaveBeenCalledWith({ id: 'mockId' });
        });

        it('should throw an error if no user is deleted', async () => {
            repository.delete.mockResolvedValue({ affected: 0 });
            expect(service.deleteUser('mockId')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findUsers', () => {
        it('should call the findUsers method of the userRepository', async () => {
            repository.findUsers.mockResolvedValue('resultOfsearch');
            const mockFindUsersQueryDto: FindUsersQueryDto = {
                name: '',
                email: '',
                limit: 1,
                page: 1,
                role: '',
                sort: '',
                status: true
            };
            const result = await service.findUsers(mockFindUsersQueryDto);
            expect(repository.findUsers).toHaveBeenCalledWith(
                mockFindUsersQueryDto
            );
            expect(result).toEqual('resultOfsearch');
        });
    });

    describe('updateUser', () => {
        it('should return affected > 0 if user data is updated and return the new user', async () => {
            repository.update.mockResolvedValue({ affected: 1 });
            repository.findOne.mockResolvedValue('mockUser') ;

            const result = await service.updateUser('mockUpdateUserDto', 'mockId');
            expect(repository.update).toHaveBeenCalledWith(
                { id: 'mockId' },
                'mockUpdateUserDto'
            );
            expect(result).toEqual('mockUser');
        });

        it('should throw an error if no row is affected in the DB', async () => {
            repository.update.mockResolvedValue({ affected: 0 });
            expect(service.updateUser('mockUpdateUserDto', 'mockId')).rejects.toThrow(NotFoundException);
        });
    });
});