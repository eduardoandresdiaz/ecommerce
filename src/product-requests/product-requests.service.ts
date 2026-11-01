import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  
  import { InjectRepository } from '@nestjs/typeorm';
  
  import { Repository } from 'typeorm';
  
  import { ProductRequest } from './product-request.entity';
  import { CreateProductRequestDto } from './dto/create-product-request.dto';
  import { User } from '../users/user.entity';
  
  @Injectable()
  export class ProductRequestsService {
    constructor(
      @InjectRepository(ProductRequest)
      private readonly productRequestRepository: Repository<ProductRequest>,
  
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
    ) {}
  
    /*
     * Crear un nuevo faltante.
     *
     * ownerId debe obtenerse desde el usuario autenticado,
     * no desde el cuerpo enviado por el frontend.
     */
    async create(
      ownerId: string,
      createProductRequestDto: CreateProductRequestDto,
    ): Promise<ProductRequest> {
      const user = await this.userRepository.findOne({
        where: {
          id: ownerId,
        },
      });
  
      if (!user) {
        throw new NotFoundException('El comercio autenticado no existe.');
      }
  
      const supplierName = createProductRequestDto.supplierName.trim();
  
      const selectedSupplier = user.proveedores?.find(
        (supplier) =>
          supplier.empresa.trim().toLowerCase() ===
          supplierName.toLowerCase(),
      );
  
      if (!selectedSupplier) {
        throw new BadRequestException(
          'El proveedor seleccionado no pertenece a este comercio.',
        );
      }
  
      const productDetail =
        createProductRequestDto.productDetail.trim();
  
      if (!productDetail) {
        throw new BadRequestException(
          'El detalle del producto es obligatorio.',
        );
      }
  
      const productRequest = this.productRequestRepository.create({
        ownerId: user.id,
  
        // Guarda el nombre exactamente como está registrado en users.proveedores.
        supplierName: selectedSupplier.empresa.trim(),
  
        productDetail,
  
        currentStock: createProductRequestDto.currentStock,
  
        requestedQuantity:
          createProductRequestDto.requestedQuantity,
  
        status: 'PENDIENTE',
  
        requestedAt: new Date(),
  
        orderedAt: null,
      });
  
      return await this.productRequestRepository.save(productRequest);
    }
  
    /*
     * Obtener todos los faltantes pendientes del comercio
     * para un proveedor determinado.
     */
    async findPendingBySupplier(
      ownerId: string,
      supplierName: string,
    ): Promise<ProductRequest[]> {
      const cleanedSupplierName = supplierName.trim();
  
      if (!cleanedSupplierName) {
        throw new BadRequestException(
          'Debes seleccionar un proveedor.',
        );
      }
  
      return await this.productRequestRepository
        .createQueryBuilder('productRequest')
        .where('productRequest.ownerId = :ownerId', {
          ownerId,
        })
        .andWhere(
          'LOWER(productRequest.supplierName) = LOWER(:supplierName)',
          {
            supplierName: cleanedSupplierName,
          },
        )
        .andWhere('productRequest.status = :status', {
          status: 'PENDIENTE',
        })
        .orderBy('productRequest.requestedAt', 'ASC')
        .getMany();
    }
  
    /*
     * Obtener todos los faltantes pendientes del comercio,
     * sin filtrar por proveedor.
     */
    async findAllPending(
      ownerId: string,
    ): Promise<ProductRequest[]> {
      return await this.productRequestRepository.find({
        where: {
          ownerId,
          status: 'PENDIENTE',
        },
        order: {
          supplierName: 'ASC',
          requestedAt: 'ASC',
        },
      });
    }
  
    /*
     * Obtener un faltante por ID.
     *
     * También verifica que el registro pertenezca
     * al comercio autenticado.
     */
    async findOne(
      ownerId: string,
      requestId: string,
    ): Promise<ProductRequest> {
      const productRequest =
        await this.productRequestRepository.findOne({
          where: {
            id: requestId,
            ownerId,
          },
        });
  
      if (!productRequest) {
        throw new NotFoundException(
          'El faltante solicitado no existe.',
        );
      }
  
      return productRequest;
    }
  
    /*
     * Eliminar un faltante pendiente.
     *
     * No permite eliminar faltantes pertenecientes
     * a otros comercios.
     */
    async remove(
      ownerId: string,
      requestId: string,
    ): Promise<{ message: string }> {
      const productRequest = await this.findOne(
        ownerId,
        requestId,
      );
  
      if (productRequest.status !== 'PENDIENTE') {
        throw new BadRequestException(
          'Solamente se pueden eliminar faltantes pendientes.',
        );
      }
  
      await this.productRequestRepository.remove(productRequest);
  
      return {
        message: 'Faltante eliminado correctamente.',
      };
    }
  
    /*
     * Equivale a hacer la línea separadora en el cuaderno.
     *
     * Todos los registros pendientes de ese proveedor
     * pasan al estado PEDIDO.
     */
    async markSupplierListAsOrdered(
      ownerId: string,
      supplierName: string,
    ): Promise<{
      message: string;
      updatedRecords: number;
    }> {
      const cleanedSupplierName = supplierName.trim();
  
      if (!cleanedSupplierName) {
        throw new BadRequestException(
          'Debes seleccionar un proveedor.',
        );
      }
  
      const result = await this.productRequestRepository
        .createQueryBuilder()
        .update(ProductRequest)
        .set({
          status: 'PEDIDO',
          orderedAt: new Date(),
          updatedAt: new Date(),
        })
        .where('owner_id = :ownerId', {
          ownerId,
        })
        .andWhere('LOWER(supplier_name) = LOWER(:supplierName)', {
          supplierName: cleanedSupplierName,
        })
        .andWhere('status = :status', {
          status: 'PENDIENTE',
        })
        .execute();
  
      const updatedRecords = result.affected ?? 0;
  
      if (updatedRecords === 0) {
        throw new NotFoundException(
          'No hay faltantes pendientes para este proveedor.',
        );
      }
  
      return {
        message: 'La lista fue marcada como pedida.',
        updatedRecords,
      };
    }
  }