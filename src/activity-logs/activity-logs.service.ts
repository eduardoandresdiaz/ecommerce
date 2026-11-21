import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

export interface ActivityLogActor {
  id?: string;
  email?: string;
  name?: string;
  merchantOwnerId?: string | null;
}

export interface ActivityLogFilters {
  actorUserId?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async recordForActor(
    actor: ActivityLogActor | undefined,
    event: {
      action: string;
      entityType: string;
      entityId?: string | null;
      changes?: Record<string, unknown> | null;
    },
  ): Promise<ActivityLog> {
    if (!actor?.id || !actor.email) {
      throw new UnauthorizedException(
        'No se pudo identificar al autor de la actividad.',
      );
    }

    return this.activityLogRepository.save(
      this.activityLogRepository.create({
        merchantOwnerId: actor.merchantOwnerId ?? actor.id,
        actorUserId: actor.id,
        actorName: actor.name?.trim() || actor.email,
        actorEmail: actor.email,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId ?? null,
        changes: event.changes ?? null,
      }),
    );
  }

  async findForMerchant(
    merchantOwnerId: string,
    filters: ActivityLogFilters,
  ): Promise<{
    items: ActivityLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = this.parsePositiveInteger(filters.page, 1, 'página');
    const limit = this.parsePositiveInteger(filters.limit, 50, 'límite');
    if (limit > 100) {
      throw new BadRequestException('El límite máximo por página es 100.');
    }

    if (filters.actorUserId && !isUUID(filters.actorUserId)) {
      throw new BadRequestException('El empleado seleccionado no es válido.');
    }

    if (filters.action && filters.action.length > 100) {
      throw new BadRequestException('El tipo de acción no es válido.');
    }

    const from = this.parseDate(filters.from, 'fecha inicial');
    const to = this.parseDate(filters.to, 'fecha final');
    if (from && to && from > to) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final.',
      );
    }

    const query = this.activityLogRepository
      .createQueryBuilder('activity')
      .where('activity.merchantOwnerId = :merchantOwnerId', {
        merchantOwnerId,
      })
      .orderBy('activity.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.actorUserId) {
      query.andWhere('activity.actorUserId = :actorUserId', {
        actorUserId: filters.actorUserId,
      });
    }
    if (filters.action) {
      query.andWhere('activity.action = :action', {
        action: filters.action,
      });
    }
    if (from) {
      query.andWhere('activity.createdAt >= :from', { from });
    }
    if (to) {
      const endOfDayExclusive = new Date(to);
      endOfDayExclusive.setUTCDate(endOfDayExclusive.getUTCDate() + 1);
      query.andWhere('activity.createdAt < :to', {
        to: endOfDayExclusive,
      });
    }

    const [items, total] = await query.getManyAndCount();
    return { items, total, page, limit };
  }

  private parsePositiveInteger(
    value: string | undefined,
    defaultValue: number,
    fieldName: string,
  ): number {
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const parsedValue = Number(value);
    if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
      throw new BadRequestException(`El valor de ${fieldName} no es válido.`);
    }
    return parsedValue;
  }

  private parseDate(
    value: string | undefined,
    fieldName: string,
  ): Date | undefined {
    if (!value) {
      return undefined;
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(`La ${fieldName} no es válida.`);
    }
    return parsedDate;
  }
}
