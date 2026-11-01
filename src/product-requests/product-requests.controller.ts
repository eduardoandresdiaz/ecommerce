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
  
  import { AuthGuard } from '@nestjs/passport';
  
  import { ProductRequestsService } from './product-requests.service';
  import { CreateProductRequestDto } from './dto/create-product-request.dto';
  
  interface AuthenticatedRequest {
    user?: {
      id?: string;
      sub?: string;
    };
  }
  
  @Controller('product-requests')
  @UseGuards(AuthGuard('jwt'))
  export class ProductRequestsController {
    constructor(
      private readonly productRequestsService: ProductRequestsService,
    ) {}
  
    /*
     * Obtiene el ID del comercio desde el JWT.
     *
     * Admite request.user.id o request.user.sub,
     * según cómo esté creada tu estrategia JWT.
     */
    private getOwnerId(request: AuthenticatedRequest): string {
      const ownerId = request.user?.id ?? request.user?.sub;
  
      if (!ownerId) {
        throw new UnauthorizedException(
          'No se pudo identificar al comercio autenticado.',
        );
      }
  
      return ownerId;
    }
  
    /*
     * Registrar un nuevo faltante.
     *
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
     * Obtener todos los faltantes pendientes
     * del comercio autenticado.
     *
     * GET /product-requests/pending
     */
    @Get('pending')
    findAllPending(
      @Req() request: AuthenticatedRequest,
    ) {
      const ownerId = this.getOwnerId(request);
  
      return this.productRequestsService.findAllPending(ownerId);
    }
  
    /*
     * Obtener los faltantes pendientes
     * de un proveedor específico.
     *
     * Ejemplo:
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
     * Marcar como pedida la lista pendiente
     * de un proveedor.
     *
     * PATCH /product-requests/mark-as-ordered?supplierName=Ingersoll
     */
    @Patch('mark-as-ordered')
    markSupplierListAsOrdered(
      @Req() request: AuthenticatedRequest,
      @Query('supplierName') supplierName: string,
    ) {
      const ownerId = this.getOwnerId(request);
  
      return this.productRequestsService.markSupplierListAsOrdered(
        ownerId,
        supplierName ?? '',
      );
    }
  
    /*
     * Obtener un faltante por su ID.
     *
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
     *
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