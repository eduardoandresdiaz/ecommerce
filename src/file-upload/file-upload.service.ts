import { Injectable } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../products/products.entity';
import { User } from '../users/user.entity'; // ✅ Importamos la entidad User
import { Repository } from 'typeorm';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileUploadRepository: FileUploadRepository,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User) // ✅ Inyectamos UserRepository correctamente
    private readonly userRepository: Repository<User>,
  ) {}

  async uploadProductImage(file: Express.Multer.File, productId: string) {
    console.log('Archivo recibido:', file);
    const productExist = await this.productRepository.findOneBy({ id: productId });
    if (!productExist) {
      return 'El producto no existe';
    }
    const uploadedImage = await this.fileUploadRepository.uploadImage(file);
    await this.productRepository.update(productId, { imgUrl: uploadedImage.secure_url });

    return await this.productRepository.findOneBy({ id: productId });
  }

  async uploadProfileImage(file: Express.Multer.File, userId: string) {
    console.log('Imagen de perfil recibida:', file);

    const userExist = await this.userRepository.findOneBy({ id: userId });
    if (!userExist) {
      return 'El usuario no existe';
    }

    const uploadedImage = await this.fileUploadRepository.uploadImage(file);
    await this.userRepository.update(userId, { imgUrlUser: uploadedImage.secure_url });

    return await this.userRepository.findOneBy({ id: userId });
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
