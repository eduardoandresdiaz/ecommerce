import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UserRepository } from './users.repository';
import { UserService } from './users.service';

describe('UserService employee management', () => {
  let service: UserService;
  let repository: {
    getUserById: jest.Mock;
    findByEmail: jest.Mock;
    findByDni: jest.Mock;
    createEmployeeForOwner: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      getUserById: jest.fn().mockResolvedValue({
        id: 'merchant-id',
        merchantOwnerId: null,
        isAdmin: false,
        isActive: true,
      }),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByDni: jest.fn().mockResolvedValue(null),
      createEmployeeForOwner: jest.fn().mockResolvedValue({
        id: 'employee-id',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('creates an employee linked to the merchant and hashes its password', async () => {
    const employee: CreateEmployeeDto = {
      name: 'Empleado Uno',
      nickname: 'empleado-uno',
      dni: '12345678',
      email: '  employee@example.com ',
      password: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
    };

    await service.createEmployee('merchant-id', employee);

    const [merchantId, employeeData] =
      repository.createEmployeeForOwner.mock.calls[0];
    expect(merchantId).toBe('merchant-id');
    expect(employeeData).toMatchObject({
      email: 'employee@example.com',
      merchantOwnerId: 'merchant-id',
      isAdmin: false,
      isActive: true,
    });
    expect(await bcrypt.compare(employee.password, employeeData.password)).toBe(
      true,
    );
    expect(employeeData.password).not.toBe(employee.password);
  });

  it('does not create an employee when the passwords do not match', async () => {
    const employee: CreateEmployeeDto = {
      name: 'Empleado Uno',
      nickname: 'empleado-uno',
      dni: '12345678',
      email: 'employee@example.com',
      password: 'StrongPass1!',
      confirmPassword: 'DifferentPass1!',
    };

    await expect(
      service.createEmployee('merchant-id', employee),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.createEmployeeForOwner).not.toHaveBeenCalled();
  });
});
