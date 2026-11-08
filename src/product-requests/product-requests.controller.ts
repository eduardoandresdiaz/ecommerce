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
  
  interface AuthenticatedRequest {
    user?: {
      id?: string;
      userId?: string;
      sub?: string;
    };
  }
  
  @Controller('product-requests')
  @UseGuards(AuthGuard)
  export class ProductRequestsController {
    constructor(
      private readonly productRequestsService: ProductRequestsService,
    ) {}
  
    private getOwnerId(request: AuthenticatedRequest): string {
      const ownerId =
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
    create(
      @Req() request: AuthenticatedRequest,
      @Body() createProductRequestDto: CreateProductRequestDto,
    ) {
      const ownerId = this.getOwnerId(request);
  
      return this.productRequestsService.create(
        ownerId,
        createProductRequestDto,
      );
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
markAsOrdered(
  @Req() request: AuthenticatedRequest,
  @Param('id', ParseUUIDPipe) requestId: string,
) {
  const ownerId = this.getOwnerId(request);

  return this.productRequestsService.markAsOrdered(
    ownerId,
    requestId,
  );
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
    remove(
      @Req() request: AuthenticatedRequest,
      @Param('id', ParseUUIDPipe) requestId: string,
    ) {
      const ownerId = this.getOwnerId(request);
  
      return this.productRequestsService.remove(
        ownerId,
        requestId,
      );
    }
  }