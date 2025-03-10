import { TestingModule, Test } from '@nestjs/testing';
import { User } from 'src/users/user.entity'; // Ruta relativa
import { UsersController } from '../users/users.controller'; // Ruta relativa
import { AuthGuard } from '../guards/auth.guard'; // Ruta relativa
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../src/users/users.service'; // Ruta relativa

describe('UsersController', () => {
  let controller: UsersController;
  let mockUserService;
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Eduardo',
      password: 'Edudiaz1234$',
      email: 'eduardoandresdiazBicho@gmail.com',
      isAdmin: true,
      phone: '1234567890',
      country: 'Colombia',
      address: 'Calle 123',
      city: 'Bogota',
      orders: [],
    },
    {
      id: '2',
      name: 'Eduardo 2',
      password: 'Edudiaz1234$',
      email: 'eduardoandresdiazBicho2@gmail.com',
      isAdmin: true,
      phone: '1234567890',
      country: 'Colombia',
      address: 'Calle 123',
      city: 'Bogota',
      orders: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn().mockResolvedValue(mockUsers[0]),
            getUsers: jest.fn().mockResolvedValue(mockUsers),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn().mockReturnValue({ userId: 'mock-user-id' }),
          },
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    mockUserService = module.get<UserService>(UserService);
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  it('debe retornar una lista de usuarios', async () => {
    const result = await controller.getUsers(1, 10);
    expect(result).toEqual(mockUsers);
    expect(mockUserService.getUsers).toHaveBeenCalledWith(1, 10);
  });

  it('debe retornar un usuario por ID', async () => {
    const result = await controller.getUserById('1');
    expect(result).toEqual(mockUsers[0]);
    expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
  });
  it('debe eliminar un usuario por ID', async () => {
    const userId = '1';
    const deleteResult = { affected: 1 }; // Ejemplo de respuesta esperada

    jest.spyOn(mockUserService, 'deleteUser').mockResolvedValue(deleteResult);

    const result = await controller.deleteUser(userId);

    expect(result).toEqual(deleteResult);
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(userId);
  });
  it('debe actualizar un usuario', async () => {
    const userId = '1';
    const updateUserDto = { name: 'Eduardo Actualizado' }; // Datos actualizados
    const updatedUser = {
      id: userId,
      name: 'Eduardo Actualizado',
      password: 'Edudiaz1234$',
      email: 'eduardoandresdiazBicho@gmail.com',
      isAdmin: true,
      phone: '1234567890',
      country: 'Colombia',
      address: 'Calle 123',
      city: 'Bogota',
      orders: [],
    };

    jest.spyOn(mockUserService, 'updateUser').mockResolvedValue(updatedUser);

    const result = await controller.updateUser(userId, updateUserDto);

    expect(result).toEqual(updatedUser);
    expect(mockUserService.updateUser).toHaveBeenCalledWith(
      userId,
      updateUserDto,
    );
  });
});
