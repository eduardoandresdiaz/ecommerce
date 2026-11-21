import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const productExist = await this.productRepository.findOneBy({
      id: productId,
    });
    if (!productExist) {
      throw new NotFoundException('El producto no existe.');
    }
    const uploadedImage = await this.fileUploadRepository.uploadImage(file);
    await this.productRepository.update(productId, {
      imgUrl: uploadedImage.secure_url,
    });

    return await this.productRepository.findOneBy({ id: productId });
  }

  async uploadProfileImage(file: Express.Multer.File, userId: string) {
    const userExist = await this.userRepository.findOneBy({ id: userId });
    if (!userExist) {
      throw new NotFoundException('El usuario no existe.');
    }

    // **Eliminar imagen anterior si existe**
    if (userExist.publicIdUser) {
      try {
        await this.deleteImage(userExist.publicIdUser);
      } catch (error) {
        console.error('Error eliminando imagen anterior:', error);
      }
    }

    // **Subir nueva imagen a Cloudinary**
    const uploadedImage = await this.fileUploadRepository.uploadImage(file);

    // **Actualizar datos del usuario con la nueva imagen**
    await this.userRepository.update(userId, {
      imgUrlUser: uploadedImage.secure_url,
      publicIdUser: uploadedImage.public_id,
    });

    return await this.userRepository.findOneBy({ id: userId });
  }

  async assertProductBelongsToMerchant(
    productId: string,
    merchantEmail: string,
  ): Promise<void> {
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new NotFoundException('El producto no existe.');
    }
    if (product.creatorEmail.toLowerCase() !== merchantEmail.toLowerCase()) {
      throw new ForbiddenException(
        'No tienes permiso para modificar este producto.',
      );
    }
  }

  async assertProductImageBelongsToMerchant(
    publicId: string,
    merchantEmail: string,
    productId: string,
  ): Promise<void> {
    const product = await this.productRepository.findOneBy({ id: productId });
    const filename = product?.imgUrl?.split('/').pop()?.split('.')[0];
    if (
      !product ||
      product.creatorEmail.toLowerCase() !== merchantEmail.toLowerCase() ||
      filename !== publicId
    ) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta imagen.',
      );
    }
  }

  async assertProfileImageBelongsToUser(
    publicId: string,
    userId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user || user.publicIdUser !== publicId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta imagen de perfil.',
      );
    }
  }

  // async uploadProfileImage(file: Express.Multer.File, userId: string) {
  //   console.log('Imagen de perfil recibida:', file);

  //   const userExist = await this.userRepository.findOneBy({ id: userId });
  //   if (!userExist) {
  //     return 'El usuario no existe';
  //   }

  //   const uploadedImage = await this.fileUploadRepository.uploadImage(file);
  //   await this.userRepository.update(userId, {
  //     imgUrlUser: uploadedImage.secure_url,
  //   });

  //   return await this.userRepository.findOneBy({ id: userId });
  // }

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
