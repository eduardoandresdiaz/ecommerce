import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UseGuards,
  } from '@nestjs/common';
  
  import { AuthGuard } from '../guards/auth.guard';
  import { ProductRequestsService } from './product-requests.service';
  import { CreateProductRequestDto } from './dto/create-product-request.dto';
  import { ReassignProductRequestDto } from './dto/reassign-product-request.dto';
  import { ActivityLogsService } from '../activity-logs/activity-logs.service';
  
  interface AuthenticatedRequest {
    user?: {
      id?: string;
      userId?: string;
      sub?: string;
      merchantOwnerId?: string | null;
      name?: string;
      email?: string;
    };
  }
  
  @Controller('product-requests')
  @UseGuards(AuthGuard)
  export class ProductRequestsController {
    constructor(
      private readonly productRequestsService: ProductRequestsService,
      private readonly activityLogsService: ActivityLogsService,
    ) {}
  
    private getOwnerId(request: AuthenticatedRequest): string {
      const ownerId =
        request.user?.merchantOwnerId ??
        request.user?.id ??
        request.user?.userId ??
        request.user?.sub;
  
      if (!ownerId) {
        throw new UnauthorizedException(
          'No se pudo identificar al comercio autenticado.',
        );
      }
  
      return ownerId;
    }
  
    /*
     * Registrar un nuevo faltante.
     * POST /product-requests
     */
    @Post()
    async create(
      @Req() request: AuthenticatedRequest,
      @Body() createProductRequestDto: CreateProductRequestDto,
    ) {
      const ownerId = this.getOwnerId(request);
  
      const productRequest = await this.productRequestsService.create(
        ownerId,
        createProductRequestDto,
      );
      await this.activityLogsService.recordForActor(request.user, {
        action: 'product_request.created',
        entityType: 'product_request',
        entityId: productRequest.id,
        changes: {
          supplierName: productRequest.supplierName,
          requestedQuantity: productRequest.requestedQuantity,
        },
      });
      return productRequest;
    }
  
    /*
     * Obtener todos los faltantes pendientes.
     * GET /product-requests/pending
     */
    @Get('pending')
    findAllPending(@Req() request: AuthenticatedRequest) {
      const ownerId = this.getOwnerId(request);
  
      return this.productRequestsService.findAllPending(ownerId);
    }
  
    @Get('unavailable')
    findUnavailable(@Req() request: AuthenticatedRequest) {
      const ownerId = this.getOwnerId(request);

      return this.productRequestsService.findUnavailable(ownerId);
    }

    /*
     * Obtener faltantes pendientes por proveedor.
     * GET /product-requests/pending-by-supplier?supplierName=Ingersoll
     */
    @Get('pending-by-supplier')
    findPendingBySupplier(
      @Req() request: AuthenticatedRequest,
      @Query('supplierName') supplierName: string,
    ) {
      const ownerId = this.getOwnerId(request);
  
      return this.productRequestsService.findPendingBySupplier(
        ownerId,
        supplierName ?? '',
      );
    }
  
    /*
     * Marcar la lista del proveedor como pedida.
     * PATCH /product-requests/mark-as-ordered?supplierName=Ingersoll
     */
    // @Patch('mark-as-ordered')
    // markSupplierListAsOrdered(
    //   @Req() request: AuthenticatedRequest,
    //   @Query('supplierName') supplierName: string,
    // ) {
    //   const ownerId = this.getOwnerId(request);
  
    //   return this.productRequestsService.markSupplierListAsOrdered(
    //     ownerId,
    //     supplierName ?? '',
    //   );
    // }
    /*
 * Marcar un faltante individual como pedido.
 * PATCH /product-requests/:id/mark-as-ordered
 */
@Patch(':id/mark-as-ordered')
async markAsOrdered(
  @Req() request: AuthenticatedRequest,
  @Param('id', ParseUUIDPipe) requestId: string,
) {
  const ownerId = this.getOwnerId(request);

  const result = await this.productRequestsService.markAsOrdered(
    ownerId,
    requestId,
  );
  await this.activityLogsService.recordForActor(request.user, {
    action: 'product_request.ordered',
    entityType: 'product_request',
    entityId: requestId,
    changes: {
      supplierName: result.productRequest.supplierName,
      requestedQuantity: result.productRequest.requestedQuantity,
    },
  });
  return result;
}

@Patch(':id/mark-as-unavailable')
async markAsUnavailable(
  @Req() request: AuthenticatedRequest,
  @Param('id', ParseUUIDPipe) requestId: string,
) {
  const ownerId = this.getOwnerId(request);

  const result = await this.productRequestsService.markAsUnavailable(
    ownerId,
    requestId,
  );
  await this.activityLogsService.recordForActor(request.user, {
    action: 'product_request.unavailable',
    entityType: 'product_request',
    entityId: requestId,
    changes: {
      supplierName: result.productRequest.supplierName,
      requestedQuantity: result.productRequest.requestedQuantity,
    },
  });
  return result;
}

@Post(':id/reassign')
async reassignToSupplier(
  @Req() request: AuthenticatedRequest,
  @Param('id', ParseUUIDPipe) requestId: string,
  @Body() reassignProductRequestDto: ReassignProductRequestDto,
) {
  const ownerId = this.getOwnerId(request);
  const previousRequest = await this.productRequestsService.findOne(
    ownerId,
    requestId,
  );

  const result = await this.productRequestsService.reassignToSupplier(
    ownerId,
    requestId,
    reassignProductRequestDto.supplierName,
  );
  await this.activityLogsService.recordForActor(request.user, {
    action: 'product_request.reassigned',
    entityType: 'product_request',
    entityId: requestId,
    changes: {
      fromSupplier: previousRequest.supplierName,
      toSupplier: result.productRequest.supplierName,
      derivedRequestId: result.productRequest.id,
    },
  });
  return result;
}

  
    /*
     * Obtener un faltante por ID.
     * GET /product-requests/:id
     */
    @Get(':id')
    findOne(
      @Req() request: AuthenticatedRequest,
      @Param('id', ParseUUIDPipe) requestId: string,
    ) {
      const ownerId = this.getOwnerId(request);
  
      return this.productRequestsService.findOne(
        ownerId,
        requestId,
      );
    }
  
    /*
     * Eliminar un faltante pendiente.
     * DELETE /product-requests/:id
     */
    @Delete(':id')
    async remove(
      @Req() request: AuthenticatedRequest,
      @Param('id', ParseUUIDPipe) requestId: string,
    ) {
      const ownerId = this.getOwnerId(request);
  
      const productRequest = await this.productRequestsService.findOne(
        ownerId,
        requestId,
      );
      const result = await this.productRequestsService.remove(
        ownerId,
        requestId,
      );
      await this.activityLogsService.recordForActor(request.user, {
        action: 'product_request.deleted',
        entityType: 'product_request',
        entityId: requestId,
        changes: {
          supplierName: productRequest.supplierName,
          requestedQuantity: productRequest.requestedQuantity,
        },
      });
      return result;
    }
  }