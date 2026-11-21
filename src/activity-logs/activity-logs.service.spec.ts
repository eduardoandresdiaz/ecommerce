import { ActivityLogsService } from './activity-logs.service';

describe('ActivityLogsService', () => {
  const activityLogRepository = {
    create: jest.fn((activity) => activity),
    save: jest.fn((activity) => Promise.resolve(activity)),
    createQueryBuilder: jest.fn(),
  };
  const service = new ActivityLogsService(activityLogRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores the actor snapshot and derives the merchant from authentication', async () => {
    const actor = {
      id: 'employee-id',
      name: 'Empleado',
      email: 'empleado@example.com',
      merchantOwnerId: 'owner-id',
    };

    await service.recordForActor(actor, {
      action: 'product.stock_changed',
      entityType: 'product',
      entityId: 'product-id',
      changes: { stock: { from: 4, to: 2 } },
    });

    expect(activityLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        merchantOwnerId: 'owner-id',
        actorUserId: 'employee-id',
        actorName: 'Empleado',
        actorEmail: 'empleado@example.com',
        entityId: 'product-id',
      }),
    );
    expect(activityLogRepository.save).toHaveBeenCalledTimes(1);
  });

  it('always scopes activity queries to the authenticated merchant', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    activityLogRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    const result = await service.findForMerchant('owner-id', {
      actorUserId: '11111111-1111-4111-8111-111111111111',
      action: 'product.created',
      from: '2025-01-01',
      to: '2025-01-31',
      page: '2',
      limit: '20',
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'activity.merchantOwnerId = :merchantOwnerId',
      { merchantOwnerId: 'owner-id' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'activity.actorUserId = :actorUserId',
      { actorUserId: '11111111-1111-4111-8111-111111111111' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'activity.action = :action',
      { action: 'product.created' },
    );
    expect(queryBuilder.skip).toHaveBeenCalledWith(20);
    expect(queryBuilder.take).toHaveBeenCalledWith(20);
    expect(result).toEqual({ items: [], total: 0, page: 2, limit: 20 });
  });
});
