import {
  Controller,
  ForbiddenException,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../guards/auth.guard';
import {
  ActivityLogActor,
  ActivityLogFilters,
  ActivityLogsService,
} from './activity-logs.service';

interface AuthenticatedRequest extends Request {
  user?: ActivityLogActor;
}

@ApiBearerAuth()
@Controller('activity-logs')
@UseGuards(AuthGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  findForMerchant(
    @Req() request: AuthenticatedRequest,
    @Query('actorUserId') actorUserId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const actor = request.user;
    if (!actor?.id) {
      throw new UnauthorizedException('No se pudo identificar al usuario.');
    }
    if (actor.merchantOwnerId !== null) {
      throw new ForbiddenException(
        'Solo el dueño del comercio puede consultar la actividad.',
      );
    }

    const filters: ActivityLogFilters = {
      actorUserId,
      action,
      from,
      to,
      page,
      limit,
    };
    return this.activityLogsService.findForMerchant(actor.id, filters);
  }
}
