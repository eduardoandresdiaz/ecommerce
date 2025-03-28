import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/products.entity';
import { Repository } from 'typeorm';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileUploadRepository: FileUploadRepository,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async uploadProductImage(file: Express.Multer.File, productId: string) {
    console.log('Archivo recibido:', file);
    const productExist = await this.productRepository.findOneBy({
      id: productId,
    });
    if (!productExist) {
      return 'El producto no existe';
    }
    const uploadedImage = await this.fileUploadRepository.uploadImage(file);
    await this.productRepository.update(productId, {
      imgUrl: uploadedImage.secure_url,
    });
    const updatedProduct = await this.productRepository.findOneBy({
      id: productId,
    });
    return updatedProduct;
  }

  async deleteImage(publicId: string): Promise<string> {
    try {
      const result = await Cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        return 'Imagen eliminada exitosamente';
      } else {
        return 'No se pudo eliminar la imagen';
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al eliminar la imagen: ${error.message}`);
      } else {
        throw new Error('Error desconocido al eliminar la imagen');
      }
    }
  }
}
