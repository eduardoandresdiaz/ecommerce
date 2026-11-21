import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductRequest } from './product-request.entity';
import { ProductRequestsService } from './product-requests.service';
import { User } from '../users/user.entity';

describe('ProductRequestsService', () => {
  const transactionRepository = {
    findOne: jest.fn(),
    create: jest.fn((values: Partial<ProductRequest>) =>
      Object.assign(new ProductRequest(), values),
    ),
    save: jest.fn(async (request: ProductRequest) => request),
  };
  const transactionManager = {
    getRepository: jest.fn().mockReturnValue(transactionRepository),
  };
  const userRepository = {
    findOne: jest.fn(),
  };
  const productRequestRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn(
        (
          callback: (manager: typeof transactionManager) => unknown,
        ) => Promise.resolve(callback(transactionManager)),
      ),
    },
  };

  let service: ProductRequestsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductRequestsService,
        {
          provide: getRepositoryToken(ProductRequest),
          useValue: productRequestRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(ProductRequestsService);
  });

  it('marks a pending product request as unavailable', async () => {
    const request = Object.assign(new ProductRequest(), {
      id: 'request-id',
      ownerId: 'owner-id',
    });
    request.status = 'PENDIENTE';
    productRequestRepository.findOne.mockResolvedValue(request);
    productRequestRepository.save.mockImplementation(
      async (updatedRequest: ProductRequest) => updatedRequest,
    );

    const result = await service.markAsUnavailable(
      'owner-id',
      'request-id',
    );

    expect(request.status).toBe('NO_DISPONIBLE');
    expect(productRequestRepository.save).toHaveBeenCalledWith(request);
    expect(result.productRequest).toBe(request);
  });

  it('lists unavailable requests only for the authenticated owner', async () => {
    productRequestRepository.find.mockResolvedValue([]);

    await service.findUnavailable('owner-id');

    expect(productRequestRepository.find).toHaveBeenCalledWith({
      where: {
        ownerId: 'owner-id',
        status: 'NO_DISPONIBLE',
      },
      order: {
        supplierName: 'ASC',
        requestedAt: 'ASC',
      },
    });
  });

  it('does not mark a non-pending request as unavailable', async () => {
    const request = Object.assign(new ProductRequest(), {
      id: 'request-id',
      ownerId: 'owner-id',
    });
    request.status = 'PEDIDO';
    productRequestRepository.findOne.mockResolvedValue(request);

    await expect(
      service.markAsUnavailable('owner-id', 'request-id'),
    ).rejects.toThrow(BadRequestException);
    expect(productRequestRepository.save).not.toHaveBeenCalled();
  });

  it('creates a pending request and records the destination supplier', async () => {
    const unavailableRequest = Object.assign(new ProductRequest(), {
      id: 'request-id',
      ownerId: 'owner-id',
      supplierName: 'Proveedor A',
      productDetail: 'Producto de prueba',
      currentStock: 2,
      requestedQuantity: 5,
      derivedSuppliers: [],
    });
    unavailableRequest.status = 'NO_DISPONIBLE';
    userRepository.findOne.mockResolvedValue({
      proveedores: [{ empresa: 'Proveedor B' }],
    });
    transactionRepository.findOne.mockResolvedValue(
      unavailableRequest,
    );

    const result = await service.reassignToSupplier(
      'owner-id',
      'request-id',
      'Proveedor B',
    );

    expect(result.productRequest.supplierName).toBe('Proveedor B');
    expect(result.productRequest.productDetail).toBe(
      'Producto de prueba',
    );
    expect(result.productRequest.status).toBe('PENDIENTE');
    expect(result.derivedSuppliers).toEqual(['Proveedor B']);
    expect(unavailableRequest.derivedSuppliers).toEqual(['Proveedor B']);
    expect(transactionRepository.save).toHaveBeenCalledTimes(2);
  });
});
